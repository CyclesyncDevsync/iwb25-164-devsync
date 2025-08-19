import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 dark:from-dark-bg dark:to-dark-surface">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary dark:text-primary-light">
                CircularSync
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-secondary dark:text-secondary-light">
                Revolutionizing Sustainable Material Management
              </h2>
              <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
                Connect recyclers, field agents, suppliers, and buyers in a transparent ecosystem to drive the circular economy forward.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/about">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <Image 
                src="/globe.svg"
                alt="Circular Economy"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-dark-bg">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-primary dark:text-primary-light">
            How CircularSync Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-dark-surface rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-admin/10 text-admin">
               <UserPlus/>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-secondary dark:text-secondary-light">Register Materials</h3>
              <p className="text-gray-600 dark:text-gray-400">Suppliers register recyclable materials in our platform</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-dark-surface rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-agent/10 text-agent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-secondary dark:text-secondary-light">Verify Quality</h3>
              <p className="text-gray-600 dark:text-gray-400">Field agents verify material quality and specifications</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-dark-surface rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-supplier/10 text-supplier">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-secondary dark:text-secondary-light">Auction Marketplace</h3>
              <p className="text-gray-600 dark:text-gray-400">Verified materials enter the auction marketplace</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-dark-surface rounded-lg shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-buyer/10 text-buyer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-secondary dark:text-secondary-light">Secure Transactions</h3>
              <p className="text-gray-600 dark:text-gray-400">Buyers purchase materials through secure transactions</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
