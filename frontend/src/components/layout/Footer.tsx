import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { DarkModeToggle } from '../ui/DarkModeToggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Features', href: '/features' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Demo', href: '/demo/enhancements' },
      ]
    },
    {
      title: 'For Users',
      links: [
        { name: 'Suppliers', href: '/supplier' },
        { name: 'Buyers', href: '/buyer' },
        { name: 'Field Agents', href: '/agent' },
        { name: 'Admins', href: '/admin' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'API Reference', href: '/api-docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Security', href: '/security' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center group">
                <Image
                  src="/globe.svg"
                  alt="CircularSync Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto group-hover:animate-pulse"
                />
                <span className="ml-2 text-xl font-bold heading-gradient">
                  CircularSync
                </span>
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Revolutionizing sustainable material management through AI-powered transparency, 
                connecting recyclers, field agents, suppliers, and buyers in a circular economy ecosystem.
              </p>
              
              {/* Theme Toggle */}
              <div className="mt-6 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme:
                </span>
                <DarkModeToggle size="sm" showLabel />
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary dark:text-primary-light">1.2K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-supplier dark:text-supplier-dark">850+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-buyer dark:text-buyer-dark">95%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (sectionIndex + 1) * 0.1 }}
              className="col-span-1"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors duration-200 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {currentYear} CircularSync. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse">♥</span>
                <span>for sustainability</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <Link 
                href="/status" 
                className="text-xs text-gray-500 hover:text-primary dark:text-gray-500 dark:hover:text-primary-light transition-colors"
              >
                System Status
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
