// src/config/plans.ts
// Single source of truth for plan definitions
export type FeatureFlags = {
  crmIntegration?: boolean;
  advancedAnalytics?: boolean;
  teamSeats?: number; // number of seats included
  priorityQueue?: boolean;
};

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number; // placeholder price
  priceAnnual?: number;
  inboxLimit: number | null; // null means unlimited
  sendCapDaily: number | null; // null means unlimited (subject to user SMTP limits)
  aiCreditsMonthly: number;
  verificationCreditsMonthly: number;
  features: FeatureFlags;
}

export const plans: Record<string, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    inboxLimit: 1,
    sendCapDaily: 100, // 50–100/day as per spec, set upper bound
    aiCreditsMonthly: 0,
    verificationCreditsMonthly: 0,
    features: {
      crmIntegration: false,
      advancedAnalytics: false,
      teamSeats: 1,
      priorityQueue: false,
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 17, // placeholder within 15–19
    inboxLimit: 3,
    sendCapDaily: null, // unlimited
    aiCreditsMonthly: 500,
    verificationCreditsMonthly: 500,
    features: {
      crmIntegration: false,
      advancedAnalytics: false,
      teamSeats: 1,
      priorityQueue: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 44, // placeholder within 39–49
    inboxLimit: null, // unlimited
    sendCapDaily: null,
    aiCreditsMonthly: 3000,
    verificationCreditsMonthly: 5000,
    features: {
      crmIntegration: true,
      advancedAnalytics: true,
      teamSeats: 1,
      priorityQueue: true,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    priceMonthly: 89, // placeholder within 79–99
    inboxLimit: null,
    sendCapDaily: null,
    aiCreditsMonthly: 10000, // higher/custom placeholder
    verificationCreditsMonthly: 15000,
    features: {
      crmIntegration: true,
      advancedAnalytics: true,
      teamSeats: 5,
      priorityQueue: true,
    },
  },
};

export default plans;
