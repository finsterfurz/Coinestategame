// ===================================
// 🎯 FLOATING ACTION BUTTONS
// ===================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Briefcase, ShoppingCart, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// ===================================
// 🎯 FLOATING ACTIONS COMPONENT
// ===================================

export const FloatingActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const actionItems = [
    {
      icon: Zap,
      label: 'Minten',
      path: '/mint',
      color: 'bg-purple-600 hover:bg-purple-700',
      delay: 0
    },
    {
      icon: Users,
      label: 'Familie',
      path: '/family',
      color: 'bg-blue-600 hover:bg-blue-700',
      delay: 0.1
    },
    {
      icon: Briefcase,
      label: 'Jobs',
      path: '/jobs',
      color: 'bg-green-600 hover:bg-green-700',
      delay: 0.2
    },
    {
      icon: ShoppingCart,
      label: 'Marktplatz',
      path: '/marketplace',
      color: 'bg-orange-600 hover:bg-orange-700',
      delay: 0.3
    }
  ];
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {actionItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ delay: item.delay, type: 'spring', stiffness: 300 }}
                >
                  <Link
                    to={item.path}
                    className={clsx(
                      'flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110',
                      item.color
                    )}
                    title={item.label}
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
      
      {/* Main FAB */}
      <motion.button
        className={clsx(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300',
          isOpen
            ? 'bg-red-600 hover:bg-red-700 rotate-45'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
        )}
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title={isOpen ? 'Schließen' : 'Aktionen'}
      >
        <Plus className="w-7 h-7 text-white" />
      </motion.button>
      
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActions;