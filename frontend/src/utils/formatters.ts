// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Time formatting
export const formatTimeRemaining = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Date formatting
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' | 'time' = 'short',
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj);

    case 'long':
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateObj);

    case 'time':
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(dateObj);

    case 'relative':
      return formatRelativeTime(dateObj);

    default:
      return dateObj.toLocaleDateString(locale);
  }
};

// Relative time formatting (e.g., "2 minutes ago", "in 5 hours")
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absDiff = Math.abs(diffInSeconds);

  // Future or past
  const isFuture = diffInSeconds > 0;
  const suffix = isFuture ? '' : ' ago';
  const prefix = isFuture ? 'in ' : '';

  if (absDiff < 60) {
    return isFuture ? 'in a few seconds' : 'just now';
  } else if (absDiff < 3600) {
    const minutes = Math.floor(absDiff / 60);
    return `${prefix}${minutes} minute${minutes !== 1 ? 's' : ''}${suffix}`;
  } else if (absDiff < 86400) {
    const hours = Math.floor(absDiff / 3600);
    return `${prefix}${hours} hour${hours !== 1 ? 's' : ''}${suffix}`;
  } else if (absDiff < 604800) {
    const days = Math.floor(absDiff / 86400);
    return `${prefix}${days} day${days !== 1 ? 's' : ''}${suffix}`;
  } else if (absDiff < 2592000) {
    const weeks = Math.floor(absDiff / 604800);
    return `${prefix}${weeks} week${weeks !== 1 ? 's' : ''}${suffix}`;
  } else if (absDiff < 31536000) {
    const months = Math.floor(absDiff / 2592000);
    return `${prefix}${months} month${months !== 1 ? 's' : ''}${suffix}`;
  } else {
    const years = Math.floor(absDiff / 31536000);
    return `${prefix}${years} year${years !== 1 ? 's' : ''}${suffix}`;
  }
};

// Number formatting
export const formatNumber = (
  num: number,
  options?: {
    decimals?: number;
    compact?: boolean;
    locale?: string;
  }
): string => {
  const { decimals = 0, compact = false, locale = 'en-US' } = options || {};

  if (compact && num >= 1000) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Duration formatting (for videos, audio, etc.)
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  }
  
  return phoneNumber;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Format address
export const formatAddress = (address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}, format: 'short' | 'full' = 'short'): string => {
  const { street, city, state, zipCode, country } = address;

  if (format === 'short') {
    const parts = [city, state].filter(Boolean);
    return parts.join(', ');
  } else {
    const parts = [street, city, state, zipCode, country].filter(Boolean);
    return parts.join(', ');
  }
};
