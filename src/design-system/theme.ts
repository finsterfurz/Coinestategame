// Design System Theme Configuration
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      dark: '#0f172a',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#475569',
    },
    game: {
      lunc: '#fbbf24',
      rare: '#8b5cf6',
      legendary: '#f59e0b',
      common: '#6b7280',
      building: '#0ea5e9',
    }
  },
  
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    game: '0 0 20px rgba(59, 130, 246, 0.3)',
    glow: '0 0 30px rgba(139, 92, 246, 0.4)',
  },
  
  animation: {
    // Timing functions
    easing: {
      linear: 'cubic-bezier(0.0, 0.0, 1.0, 1.0)',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      easeIn: 'cubic-bezier(0.42, 0.0, 1.0, 1.0)',
      easeOut: 'cubic-bezier(0.0, 0.0, 0.58, 1.0)',
      easeInOut: 'cubic-bezier(0.42, 0.0, 0.58, 1.0)',
      gameSmooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      gameBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // Duration
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
    },
    
    // Game-specific animations
    character: {
      mint: {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        transition: { duration: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }
      },
      hover: {
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 }
      },
      select: {
        scale: 1.1,
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
        transition: { duration: 0.15 }
      }
    },
    
    lunc: {
      earn: {
        initial: { y: -20, opacity: 0, scale: 0.8 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: 20, opacity: 0, scale: 1.2 },
        transition: { duration: 0.4 }
      },
      pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 1, repeat: Infinity }
      }
    },
    
    building: {
      floor: {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        transition: { duration: 0.3 }
      }
    }
  },
  
  // Component variants
  components: {
    button: {
      base: `
        inline-flex items-center justify-center
        px-4 py-2 rounded-lg font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      variants: {
        primary: `
          bg-blue-500 hover:bg-blue-600 text-white
          focus:ring-blue-500 shadow-md hover:shadow-lg
        `,
        secondary: `
          bg-gray-200 hover:bg-gray-300 text-gray-900
          focus:ring-gray-500
        `,
        success: `
          bg-green-500 hover:bg-green-600 text-white
          focus:ring-green-500
        `,
        warning: `
          bg-yellow-500 hover:bg-yellow-600 text-white
          focus:ring-yellow-500
        `,
        danger: `
          bg-red-500 hover:bg-red-600 text-white
          focus:ring-red-500
        `,
        game: `
          bg-gradient-to-r from-blue-500 to-purple-600
          hover:from-blue-600 hover:to-purple-700
          text-white shadow-game
          transform hover:scale-105 active:scale-95
        `
      },
      sizes: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl'
      }
    },
    
    card: {
      base: `
        bg-white rounded-lg border border-gray-200
        shadow-sm hover:shadow-md transition-shadow duration-200
      `,
      variants: {
        elevated: 'shadow-lg hover:shadow-xl',
        game: 'shadow-game hover:shadow-glow border-blue-200',
        character: `
          transform hover:scale-105 transition-transform duration-200
          border-2 hover:border-blue-300
        `
      }
    },
    
    input: {
      base: `
        block w-full px-3 py-2 border border-gray-300 rounded-md
        shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-50 disabled:text-gray-500
      `,
      variants: {
        error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
        success: 'border-green-300 focus:ring-green-500 focus:border-green-500'
      }
    }
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  }
} as const;

// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;

// CSS custom properties for easy use in CSS files
export const cssVariables = `
:root {
  /* Colors */
  --color-primary: ${theme.colors.primary[500]};
  --color-secondary: ${theme.colors.secondary[500]};
  --color-success: ${theme.colors.success[500]};
  --color-warning: ${theme.colors.warning[500]};
  --color-error: ${theme.colors.error[500]};
  --color-lunc: ${theme.colors.game.lunc};
  
  /* Spacing */
  --spacing-xs: ${theme.spacing[1]};
  --spacing-sm: ${theme.spacing[2]};
  --spacing-md: ${theme.spacing[4]};
  --spacing-lg: ${theme.spacing[8]};
  --spacing-xl: ${theme.spacing[16]};
  
  /* Border radius */
  --radius-sm: ${theme.borderRadius.sm};
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
  
  /* Shadows */
  --shadow-sm: ${theme.boxShadow.sm};
  --shadow-md: ${theme.boxShadow.md};
  --shadow-lg: ${theme.boxShadow.lg};
  --shadow-game: ${theme.boxShadow.game};
  
  /* Animation */
  --duration-fast: ${theme.animation.duration.fast};
  --duration-normal: ${theme.animation.duration.normal};
  --duration-slow: ${theme.animation.duration.slow};
  
  /* Ease functions */
  --ease-smooth: ${theme.animation.easing.gameSmooth};
  --ease-bounce: ${theme.animation.easing.gameBounce};
}
`;

export default theme;
