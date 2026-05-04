import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, Settings, Home, Film, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-brand-bg/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full w-full">
          {/* Left Side: Logo */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-3 cursor-pointer select-none group relative"
            onClick={() => setLocation('/')}
          >
            <div className="absolute -inset-2 bg-brand-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Film className="text-brand-primary relative z-10" size={28} strokeWidth={2.5} />
            <span className="text-xl md:text-2xl font-bold relative z-10">
              <span className="text-white">Cine</span>
              <span className="text-brand-primary">Weave</span>
            </span>
          </motion.div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className="relative px-4 py-2 font-medium text-sm transition-colors"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.layoutId 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full shadow-[0_-2px_10px_rgba(124,58,237,0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/settings')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <Settings size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-primary-light text-white px-5 py-2 rounded-full font-medium text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-shadow"
            >
              <Plus size={16} />
              <span>New Project</span>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/settings')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </motion.button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-bg/95 backdrop-blur-xl z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ ease: "easeOut", duration: 0.2 }}
              className="fixed inset-x-4 top-20 bg-brand-card border border-brand-border rounded-2xl shadow-2xl z-50 md:hidden overflow-hidden flex flex-col"
            >
              <div className="flex flex-col py-2">
                {[...navLinks, { name: 'Settings', path: '/settings' }].map((link, i) => (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`text-left px-6 py-4 font-medium transition-colors ${
                      location === link.path
                        ? 'text-brand-primary bg-brand-primary/10'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </motion.button>
                ))}
                
                <div className="p-4 mt-2 border-t border-brand-border">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-primary to-brand-primary-light text-white px-5 py-3 rounded-xl font-medium"
                  >
                    <Plus size={18} />
                    <span>New Project</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
