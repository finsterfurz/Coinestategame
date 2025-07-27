import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme } from './theme';

// Button Component with Animation
interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'game';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = theme.components.button.base;
  const variantClasses = theme.components.button.variants[variant];
  const sizeClasses = theme.components.button.sizes[size];

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Loading...
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Card Component with Animation
interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'game' | 'character';
  hover?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = theme.components.card.base;
  const variantClasses = variant !== 'default' ? theme.components.card.variants[variant] : '';

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses} ${className}`}
      whileHover={hover ? { y: -2, scale: 1.02 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  error?: string;
  success?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  label,
  error,
  success,
  className = '',
  ...props
}) => {
  const baseClasses = theme.components.input.base;
  const variantClasses = variant !== 'default' ? theme.components.input.variants[variant] : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      />
      {error && (
        <motion.p
          className="mt-1 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      {success && (
        <motion.p
          className="mt-1 text-sm text-green-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.p>
      )}
    </div>
  );
};

// Badge Component
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'rare' | 'legendary' | 'common';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  animate?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  animate = false
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    error: 'bg-red-100 text-red-800',
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800 shadow-glow',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const MotionSpan = animate ? motion.span : 'span';

  return (
    <MotionSpan
      className={`
        inline-flex items-center rounded-full font-medium
        ${variants[variant]} ${sizes[size]}
      `}
      {...(animate ? {
        initial: { scale: 0 },
        animate: { scale: 1 },
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : {})}
    >
      {children}
    </MotionSpan>
  );
};

// Modal Component with Animation
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-modal flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        className={`
          relative bg-white rounded-lg shadow-xl p-6 mx-4
          ${sizes[size]} w-full
        `}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="!p-1"
            >
              ✕
            </Button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

// Loading Spinner with Animation
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'text-blue-500'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`${sizes[size]} ${color} border-2 border-current border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

// Toast Notification Component
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  isVisible,
  onClose
}) => {
  const variants = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <motion.div
      className={`
        fixed top-4 right-4 z-toast px-4 py-3 rounded-lg shadow-lg
        flex items-center space-x-2 ${variants[type]}
      `}
      initial={{ opacity: 0, x: 100 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <span>{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200"
      >
        ✕
      </button>
    </motion.div>
  );
};

// Game-specific components
export const CharacterCard: React.FC<{
  character: any;
  onClick?: () => void;
  isSelected?: boolean;
}> = ({ character, onClick, isSelected = false }) => {
  return (
    <motion.div
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-blue-500 shadow-game' 
          : 'border-gray-200 hover:border-blue-300'
        }
        ${character.type === 'legendary' ? 'bg-gradient-to-br from-yellow-50 to-orange-50' :
          character.type === 'rare' ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
          'bg-white'
        }
      `}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{character.name}</h3>
          <p className="text-sm text-gray-600">{character.job}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={character.type} size="sm">
              {character.type}
            </Badge>
            <span className="text-sm font-medium text-yellow-600">
              {character.dailyEarnings} LUNC/day
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const LuncDisplay: React.FC<{
  amount: number;
  animate?: boolean;
}> = ({ amount, animate = false }) => {
  return (
    <motion.div
      className="flex items-center space-x-1"
      animate={animate ? { scale: [1, 1.1, 1] } : undefined}
      transition={{ duration: 0.3 }}
    >
      <span className="text-yellow-500 text-lg">🪙</span>
      <span className="font-bold text-yellow-600">
        {amount.toLocaleString()} LUNC
      </span>
    </motion.div>
  );
};
