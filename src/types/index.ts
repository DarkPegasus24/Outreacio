/**
 * Type definitions for Outreacio Email Automation Platform
 */

// Base campaign structure with full typing
export interface CampaignJob {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipientListId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Navigation step definitions for wizard flow
export type WizardStep = 'create' | 'review' | 'launch';

export interface NavigationStep {
  id: number;
  name: string;
  component: React.ComponentType<any>;
}
