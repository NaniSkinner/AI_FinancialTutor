// Design Tokens for SpendSense Operator Dashboard
// Consistent styling variables for colors, spacing, typography

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Priority colors
  priority: {
    high: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  
  // Persona colors
  persona: {
    high_utilization: {
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    variable_income_budgeter: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
    },
    student: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    subscription_heavy: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
    },
    savings_builder: {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
  },
  
  // Status colors
  status: {
    pending: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    flagged: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  full: '9999px',
};

// ============================================================================
// FONT SIZES
// ============================================================================

export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
};

