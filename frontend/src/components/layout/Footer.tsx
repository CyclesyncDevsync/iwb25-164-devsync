import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/globe.svg"
                alt="CircularSync Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-primary dark:text-primary-light">
                CircularSync
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Revolutionizing sustainable material management through a transparent ecosystem connecting recyclers, field agents, suppliers, and buyers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/documentation" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/contact" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} CircularSync. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
