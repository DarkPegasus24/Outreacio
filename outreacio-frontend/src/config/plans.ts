// src/config/plans.ts
// Single source of truth for plan definitions
export type FeatureFlags = {
  crmIntegration?: boolean;
  advancedAnalytics?: boolean;
  teamSeats?: number;
  priorityQueue?: boolean;
  csvExcelImport?: boolean;
  templatePersonalization?: boolean;
  liveTracking?: boolean;
  zeroDiskStorage?: boolean;
};

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceINR?: number;
  priceAnnual?: number;
  inboxLimit: number | null; // null means unlimited
  sendCapDaily: number | null; // null means unlimited (subject to user SMTP limits)
  aiCreditsMonthly?: number;
  verificationCreditsMonthly?: number;
  features: FeatureFlags;
}

export const plans: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    priceMonthly: 0,
    priceINR: 0,
    inboxLimit: 1,
    sendCapDaily: 25, // 25 emails / day
    aiCreditsMonthly: 0,
    verificationCreditsMonthly: 0,
    features: {
      crmIntegration: false,
      advancedAnalytics: false,
      teamSeats: 1,
      priorityQueue: false,
      csvExcelImport: true,
      templatePersonalization: true,
      liveTracking: true,
      zeroDiskStorage: true
    },
  },
  pro: {
    id: 'pro',
    name: 'Paid Plan',
    priceMonthly: 4.99,
    priceINR: 425, // INR equivalent (~₹425/mo at ₹85/$)
    inboxLimit: null, // unlimited
    sendCapDaily: 150, // 150 emails / day
    aiCreditsMonthly: 0,
    verificationCreditsMonthly: 0,
    features: {
      crmIntegration: false,
      advancedAnalytics: false,
      teamSeats: 1,
      priorityQueue: true,
      csvExcelImport: true,
      templatePersonalization: true,
      liveTracking: true,
      zeroDiskStorage: true
    },
  }
  /*
  // COMMENTED OUT: Service limited to dedicated email delivery service
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 17,
    inboxLimit: 3,
    sendCapDaily: null,
    aiCreditsMonthly: 500,
    verificationCreditsMonthly: 500,
    features: {
      crmIntegration: false,
      advancedAnalytics: false,
      teamSeats: 1,
      priorityQueue: false,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    priceMonthly: 89,
    inboxLimit: null,
    sendCapDaily: null,
    aiCreditsMonthly: 10000,
    verificationCreditsMonthly: 15000,
    features: {
      crmIntegration: true,
      advancedAnalytics: true,
      teamSeats: 5,
      priorityQueue: true,
    },
  },
  */
};

export default plans;
