import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
    <footer className="bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 border-t border-green-100 dark:border-slate-700 shadow-2xl shadow-green-100/20 dark:shadow-slate-900/50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="flex items-center group">
                <div className="relative">
                  <Image
                    src="/logo_1.png"
                    alt="CircularSync Logo"
                    width={80}
                    height={80}
                    className="h-20 w-auto transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="ml-1 text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  CircularSync
                </span>
              </Link>
              <p className="mt-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Revolutionizing sustainable material management through advanced transparency, 
                connecting recyclers, field agents, suppliers, and buyers in a circular economy ecosystem.
              </p>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                  <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">1.2K+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active Users</div>
                </div>
                <div className="text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                  <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">850+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Materials</div>
                </div>
                <div className="text-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                  <div className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">95%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Satisfaction</div>
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6 relative">
                {section.title}
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 hover:translate-x-1 flex items-center group"
                    >
                      <div className="w-1 h-1 bg-green-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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
          className="mt-16 pt-8 border-t border-green-100 dark:border-slate-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                © {currentYear} CircularSync. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse text-lg">♥</span>
                <span>for sustainability</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span>All systems operational</span>
              </div>
              <Link 
                href="/status" 
                className="text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-all duration-200 hover:scale-105 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg shadow-green-100/20 dark:shadow-slate-900/30 border border-green-100/50 dark:border-slate-700/50"
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
