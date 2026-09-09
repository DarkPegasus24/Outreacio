/**
 * Route constants for Outreacio application.
 * Centralizes all navigation paths for consistency and easy maintenance.
 */

// Public routes
export const PUBLIC_ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};

// Admin routes
export const ADMIN_ROUTES = {
  PAYMENTS: '/admin/payments',
  VERIFICATION: '/admin/payments/verify',
  NOTIFICATIONS: '/admin/notifications',
};

// Campaign routes
export const CAMPAIGN_ROUTES = {
  ACTIVE: '/campaigns/active',
  PAUSED: '/campaigns/paused',
  COMPLETED: '/campaigns/completed',
  EDIT: '/campaigns/:id/edit',
};

// Job tracking routes
export const JOB_TRACKING_ROUTES = {
  ACTIVE_JOBS: '/jobs/active',
  HISTORY: '/jobs/history',
};

// Helper to get route by name
export const getUserRoute = (name: string): string => {
  switch (name) {
    case 'landing': return PUBLIC_ROUTES.LANDING;
    case 'login': return PUBLIC_ROUTES.LOGIN;
    case 'dashboard': return PUBLIC_ROUTES.DASHBOARD;
    case 'active-campaigns': return CAMPAIGN_ROUTES.ACTIVE;
    case 'paused-campaigns': return CAMPAIGN_ROUTES.PAUSED;
    case 'completed-campaigns': return CAMPAIGN_ROUTES.COMPLETED;
    case 'admin-payments': return ADMIN_ROUTES.PAYMENTS;
    default: return PUBLIC_ROUTES.LOGIN;
  }
};
