'use client';

interface VerificationData {
  id: string;
  photos: string[];
  qualityScore?: number;
  specifications?: any;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  verification: {
    agentId: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
    qualityScore?: number;
    specifications?: any;
  };
}

interface OfflineData {
  verifications: VerificationData[];
  lastSync: number;
}

class OfflineStorageManager {
  private readonly STORAGE_KEY = 'cyclesync_offline_data';
  private readonly DB_NAME = 'CycleSyncDB';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if running in browser environment
      if (typeof window === 'undefined' || !window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage');
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('verifications')) {
          const verificationStore = db.createObjectStore('verifications', { keyPath: 'id' });
          verificationStore.createIndex('timestamp', 'verification.timestamp', { unique: false });
          verificationStore.createIndex('status', 'verification.status', { unique: false });
        }

        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('verificationId', 'verificationId', { unique: false });
        }
      };
    });
  }

  async saveVerification(data: VerificationData): Promise<void> {
    try {
      if (this.db) {
        await this.saveToIndexedDB(data);
      } else {
        await this.saveToLocalStorage(data);
      }
      console.log('Verification saved offline:', data.id);
    } catch (error) {
      console.error('Failed to save verification offline:', error);
      throw error;
    }
  }

  private async saveToIndexedDB(data: VerificationData): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['verifications', 'photos'], 'readwrite');
      const verificationStore = transaction.objectStore('verifications');
      const photoStore = transaction.objectStore('photos');

      // Save verification data
      const verificationRequest = verificationStore.put(data);

      // Save photos separately to handle large data
      data.photos.forEach((photo, index) => {
        const photoData = {
          id: `${data.id}_${index}`,
          verificationId: data.id,
          data: photo,
          timestamp: Date.now()
        };
        photoStore.put(photoData);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async saveToLocalStorage(data: VerificationData): Promise<void> {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        console.warn('localStorage not available on server side');
        return;
      }
      
      const existingData = this.getOfflineData();
      existingData.verifications.push(data);
      existingData.lastSync = Date.now();
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
    } catch (error) {
      console.error('localStorage save failed:', error);
      throw error;
    }
  }

  async getOfflineVerifications(): Promise<VerificationData[]> {
    try {
      if (this.db) {
        return await this.getFromIndexedDB();
      } else {
        return this.getOfflineData().verifications;
      }
    } catch (error) {
      console.error('Failed to get offline verifications:', error);
      return [];
    }
  }

  private async getFromIndexedDB(): Promise<VerificationData[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['verifications'], 'readonly');
      const store = transaction.objectStore('verifications');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private getOfflineData(): OfflineData {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        return { verifications: [], lastSync: 0 };
      }
      
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { verifications: [], lastSync: 0 };
    } catch (error) {
      console.error('Failed to parse offline data:', error);
      return { verifications: [], lastSync: 0 };
    }
  }

  async syncToServer(): Promise<{ success: number; failed: number }> {
    const verifications = await this.getOfflineVerifications();
    let success = 0;
    let failed = 0;

    for (const verification of verifications) {
      try {
        const response = await fetch('/api/agent/verify-material', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verification)
        });

        if (response.ok) {
          await this.removeOfflineVerification(verification.id);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Sync failed for verification:', verification.id, error);
        failed++;
      }
    }

    return { success, failed };
  }

  async removeOfflineVerification(id: string): Promise<void> {
    try {
      if (this.db) {
        await this.removeFromIndexedDB(id);
      } else {
        await this.removeFromLocalStorage(id);
      }
    } catch (error) {
      console.error('Failed to remove offline verification:', error);
    }
  }

  private async removeFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['verifications', 'photos'], 'readwrite');
      const verificationStore = transaction.objectStore('verifications');
      const photoStore = transaction.objectStore('photos');

      // Remove verification
      verificationStore.delete(id);

      // Remove associated photos
      const photoIndex = photoStore.index('verificationId');
      const photoRequest = photoIndex.openCursor(IDBKeyRange.only(id));
      
      photoRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          photoStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    const existingData = this.getOfflineData();
    existingData.verifications = existingData.verifications.filter(v => v.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
  }

  async clearAllData(): Promise<void> {
    try {
      if (this.db) {
        const transaction = this.db.transaction(['verifications', 'photos'], 'readwrite');
        const verificationStore = transaction.objectStore('verifications');
        const photoStore = transaction.objectStore('photos');
        
        verificationStore.clear();
        photoStore.clear();
      }
      
      // Check if running in browser environment
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  async getStorageSize(): Promise<{ verifications: number; photos: number; total: string }> {
    const verifications = await this.getOfflineVerifications();
    const photoCount = verifications.reduce((sum, v) => sum + v.photos.length, 0);
    
    // Estimate size
    const dataStr = JSON.stringify(verifications);
    const sizeInBytes = new Blob([dataStr]).size;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    return {
      verifications: verifications.length,
      photos: photoCount,
      total: `${sizeInMB} MB`
    };
  }

  // Check if online and auto-sync
  async autoSync(): Promise<void> {
    if (navigator.onLine) {
      try {
        const result = await this.syncToServer();
        if (result.success > 0) {
          console.log(`Successfully synced ${result.success} verifications`);
        }
        if (result.failed > 0) {
          console.warn(`Failed to sync ${result.failed} verifications`);
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
  }
}

// Lazy-loaded singleton instance
let offlineStorageInstance: OfflineStorageManager | null = null;

const getOfflineStorage = (): OfflineStorageManager => {
  if (!offlineStorageInstance && typeof window !== 'undefined') {
    offlineStorageInstance = new OfflineStorageManager();
    
    // Auto-sync when coming online
    window.addEventListener('online', () => {
      offlineStorageInstance?.autoSync();
    });
  }
  
  // Return a mock instance for SSR
  if (typeof window === 'undefined') {
    return {
      saveVerification: async () => {},
      getOfflineVerifications: async () => [],
      removeVerification: async () => {},
      syncToServer: async () => [],
      autoSync: async () => {},
      clearAllData: async () => {},
      getStorageSize: () => ({ used: 0, available: 0 })
    } as any;
  }
  
  return offlineStorageInstance!;
};

// Export singleton getter function
export { getOfflineStorage };

// Export default singleton (with SSR safety)
const OfflineStorage = typeof window !== 'undefined' ? getOfflineStorage() : null;

export default OfflineStorage;
