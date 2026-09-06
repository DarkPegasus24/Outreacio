import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Header from './components/Header';
import PricingPage from './components/PricingPage';
import LandingPage from './components/LandingPage';
import ContactPage from './components/ContactPage';
import WizardStepper from './components/WizardStepper';
import DeliverabilityModal from './components/DeliverabilityModal';
import SmtpConfigCard from './components/SmtpConfigCard';
import RecipientManager from './components/RecipientManager';
import EmailComposer from './components/EmailComposer';
import CampaignMonitor from './components/CampaignMonitor';
import CampaignHistory from './components/CampaignHistory';
import LoginPage from './components/LoginPage';
import PageTransitionLoader from './components/PageTransitionLoader';
import AdminPaymentsPage from './components/AdminPaymentsPage';
import NotFoundPage from './components/NotFoundPage';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './supabaseClient';
import './App.css';

export default function App() {
  const [dashboardTab, setDashboardTab] = useState('campaign'); // 'campaign' | 'history'
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authenticated Google session via Supabase on app load (do not hijack current page)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          picture: u.user_metadata?.avatar_url || u.user_metadata?.picture || ''
        });

        // Only redirect to dashboard if specifically returning from an OAuth callback with token hash
        if (window.location.hash.includes('access_token')) {
          setCurrentView('dashboard');
          window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          picture: u.user_metadata?.avatar_url || u.user_metadata?.picture || ''
        });

        // Only switch to dashboard if explicitly returning from OAuth token hash
        if (window.location.hash.includes('access_token')) {
          setCurrentView('dashboard');
          window.history.replaceState({ view: 'dashboard' }, '', '/dashboard');
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
    };
  }, []);

  // Determine initial view purely from clean URL pathname
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // If returning from OAuth redirect with access_token in hash, go to dashboard
    if (hash.includes('access_token') || path === '/dashboard' || path.startsWith('/dashboard/')) {
      return 'dashboard';
    }
    if (path === '/login' || path.startsWith('/login/')) {
      return 'login';
    }
    if (path === '/contact' || path.startsWith('/contact/')) {
      return 'contact';
    }
    if (path === '/pricing' || path.startsWith('/pricing/')) {
      return 'pricing';
    }
    if (path === '/8bytestudio' || path.startsWith('/8bytestudio/')) {
      return 'admin-payments';
    }
    if (path === '/' || path === '/landing' || path === '') {
      return 'landing';
    }
    return 'notfound';
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState('landing');
  const [wizardStep, setWizardStep] = useState(1);
  const [isGmailVerified, setIsGmailVerified] = useState(false);

  // Sync document title and clean browser URL without any # hash tags
  useEffect(() => {
    // Strip any lingering hash if present in URL
    if (window.location.hash && currentView !== 'notfound') {
      const cleanPath = currentView === 'dashboard' ? '/dashboard' : (currentView === 'contact' ? '/contact' : (currentView === 'login' ? '/login' : (currentView === 'pricing' ? '/pricing' : (currentView === 'admin-payments' ? '/8bytestudio' : '/'))));
      window.history.replaceState({ view: currentView }, '', cleanPath);
    }

    if (currentView === 'landing') {
      document.title = 'Outreacio | Bulk Email Automation Platform';
      if (window.location.pathname !== '/' && window.location.pathname !== '/landing') {
        window.history.pushState({ view: 'landing' }, '', '/');
      }
    } else if (currentView === 'contact') {
      document.title = 'Outreacio | Contact & FAQ';
      if (!window.location.pathname.includes('/contact')) {
        window.history.pushState({ view: 'contact' }, '', '/contact');
      }
    } else if (currentView === 'login') {
      document.title = 'Outreacio | Sign In with Google';
      if (!window.location.pathname.includes('/login')) {
        window.history.pushState({ view: 'login' }, '', '/login');
      }
    } else if (currentView === 'pricing') {
      document.title = 'Outreacio | Simple Transparent Pricing';
      if (!window.location.pathname.includes('/pricing')) {
        window.history.pushState({ view: 'pricing' }, '', '/pricing');
      }
    } else if (currentView === 'admin-payments') {
      document.title = 'Outreacio | Admin Payment Verification';
      if (!window.location.pathname.includes('/8bytestudio')) {
        window.history.pushState({ view: 'admin-payments' }, '', '/8bytestudio');
      }
    } else if (currentView === 'notfound') {
      document.title = '404 - Page Not Found | Outreacio';
    } else {
      document.title = 'Outreacio | Campaign Dashboard';
      if (!window.location.pathname.includes('/dashboard')) {
        window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
      }
    }
  }, [currentView]);

  // Handle browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('login')) {
        setCurrentView('login');
      } else if (path.includes('dashboard')) {
        setCurrentView('dashboard');
      } else if (path.includes('pricing')) {
        setCurrentView('pricing');
      } else if (path.includes('contact')) {
        setCurrentView('contact');
      } else if (path.includes('8bytestudio')) {
        setCurrentView('admin-payments');
      } else if (path === '/' || path === '/landing' || path === '') {
        setCurrentView('landing');
      } else {
        setCurrentView('notfound');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToView = (view) => {
    if (view === currentView) return;

    setIsTransitioning(false);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchApp = () => {
    if (user) {
      navigateToView('dashboard');
    } else {
      navigateToView('login');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    try {
      localStorage.removeItem('outreacio_auth_token');
    } catch (e) {}
    setUser(null);
    navigateToView('landing');
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    navigateToView('dashboard');
  };

  // Session Security & CSRF Token
  const [csrfToken, setCsrfToken] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // 1. Gmail Authentication Config State (Gmail-Only)
  const [smtpConfig, setSmtpConfig] = useState({
    senderName: '',
    user: '',
    pass: ''
  });

  // 2. Recipients State
  const [recipients, setRecipients] = useState([]);

  // 3. Email Content & Attachments State
  const [subject, setSubject] = useState('Exclusive Update for {{Company Name}}');
  const [bodyHtml, setBodyHtml] = useState(
    '<p>Hi <strong>{{Company Name}}</strong> Team,</p><p>We wanted to reach out regarding your current workflow and share how our automated tools can save you hours each week.</p><p>Would you have 10 minutes for a quick intro this week?</p><p>Best regards,<br><strong>Alex from Outreacio</strong></p>'
  );
  const [attachments, setAttachments] = useState([]);

  // 4. Rate Limiting State (default 2.0s = 2000ms)
  const [throttleDelay, setThrottleDelay] = useState(2000);

  // 5. Job & Live Delivery State
  const [jobState, setJobState] = useState({
    jobId: null,
    status: 'idle',
    total: 0,
    sent: 0,
    failed: 0,
    logs: []
  });

  const eventSourceRef = useRef(null);

  // Fetch CSRF Token on load
  const fetchCsrfToken = async () => {
    try {
      const res = await fetch('/api/csrf-token');
      const data = await res.json();
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch (e) {
      console.error('Failed to get CSRF token', e);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Validation Flags for Wizard Gates
  const isStep1Valid = isGmailVerified;
  // Every entry in `recipients` is already a confirmed-valid email | invalid
  // rows are filtered out silently at upload time in RecipientManager.
  const validRecipients = recipients;
  const isStep2Valid = validRecipients.length > 0;
  const isStep3Valid = (subject || '').trim().length > 0 && (bodyHtml || '').trim().length > 0;
  const isSending = jobState.status === 'running';

  const isStepCompleted = (stepId) => {
    if (stepId === 1) return isStep1Valid;
    if (stepId === 2) return isStep2Valid;
    if (stepId === 3) return isStep3Valid;
    if (stepId === 4) return jobState.status === 'completed';
    return false;
  };

  const handleStepClick = (stepId) => {
    if (isSending) return;
    if (stepId <= wizardStep || isStepCompleted(stepId - 1)) {
      setWizardStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextStep = () => {
    if (wizardStep === 1 && isStep1Valid) {
      setWizardStep(2);
    } else if (wizardStep === 2 && isStep2Valid) {
      setWizardStep(3);
    } else if (wizardStep === 3 && isStep3Valid) {
      setWizardStep(4);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (isSending) return;
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Launch Bulk Send Batch Job
  const handleStartCampaign = async () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      alert('Please complete and verify all steps before launching.');
      return;
    }

    // Close any previous SSE stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // Convert File objects to base64 before sending to backend
      const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const base64 = typeof result === 'string' ? result.split(',')[1] || '' : '';
          resolve({
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            content: base64
          });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      const base64Attachments = await Promise.all(attachments.map(fileToBase64));

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        alert('Your session has expired. Please sign in again.');
        navigateToView('login');
        return;
      }

      const response = await fetch('/api/send-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          smtpConfig: {
            user: smtpConfig.user.trim(),
            pass: smtpConfig.pass.trim()
          },
          senderName: smtpConfig.senderName,
          senderEmail: smtpConfig.user.trim(),
          subject,
          bodyHtml,
          recipients: validRecipients,
          throttleDelayMs: throttleDelay,
          attachments: base64Attachments
        })
      });

      const data = await response.text().then(text => {
        if (!text) {
          throw new Error('Server sent an empty response. This usually means the backend was waking up (cold start) or restarted mid-request. Please wait a few seconds and try again.');
        }
        try {
          return JSON.parse(text);
        } catch (parseErr) {
          throw new Error(`Server returned an unexpected response (status ${response.status}). Please try again in a moment.`);
        }
      });
      if (!response.ok || !data.success) {
        alert(`Failed to start campaign: ${data.error || data.message || 'Unknown error'}`);
        return;
      }

      const newJobId = data.jobId;
      setJobState({
        jobId: newJobId,
        status: 'running',
        total: validRecipients.length,
        sent: 0,
        failed: 0,
        logs: []
      });

      // Connect to SSE Endpoint for live progress
      const sse = new EventSource(`/api/job-stream/${newJobId}`);
      eventSourceRef.current = sse;

      sse.addEventListener('snapshot', (e) => {
        const snap = JSON.parse(e.data);
        setJobState((prev) => ({
          ...prev,
          status: snap.status,
          total: snap.total,
          sent: snap.sent,
          failed: snap.failed,
          logs: snap.logs || []
        }));
      });

      sse.addEventListener('progress', (e) => {
        const update = JSON.parse(e.data);
        setJobState((prev) => {
          const logs = [...prev.logs];
          if (update.latestLog) {
            logs.unshift(update.latestLog);
          }
          return {
            ...prev,
            status: 'running',
            total: update.total,
            sent: update.sent,
            failed: update.failed,
            logs
          };
        });
      });

      sse.addEventListener('job_completed', (e) => {
        const payload = JSON.parse(e.data);
        setJobState((prev) => ({
          ...prev,
          status: 'completed',
          sent: payload.sent,
          failed: payload.failed
        }));
        sse.close();
      });

      sse.addEventListener('job_cancelled', (e) => {
        const payload = JSON.parse(e.data);
        setJobState((prev) => ({
          ...prev,
          status: 'cancelled',
          sent: payload.sent,
          failed: payload.failed
        }));
        sse.close();
      });

      sse.addEventListener('job_error', (e) => {
        const payload = JSON.parse(e.data);
        alert(`Job Error: ${payload.error}`);
        setJobState((prev) => ({
          ...prev,
          status: 'error'
        }));
        sse.close();
      });

      sse.onerror = (err) => {
        console.warn('SSE disconnected or completed', err);
      };

    } catch (err) {
      alert(`Network error starting campaign: ${err.message}`);
    }
  };

  // Cancel Running Campaign
  const handleCancelCampaign = async () => {
    if (!jobState.jobId) return;

    try {
      await fetch(`/api/job-cancel/${jobState.jobId}`, {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken
        }
      });
    } catch (err) {
      console.error('Cancel request failed', err);
    }
  };

  // Reset entire workflow session
  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all data and clear temporary session?')) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setWizardStep(1);
      setIsGmailVerified(false);
      setSmtpConfig({
        senderName: '',
        user: '',
        pass: ''
      });
      setRecipients([]);
      setAttachments([]);
      setJobState({
        jobId: null,
        status: 'idle',
        total: 0,
        sent: 0,
        failed: 0,
        logs: []
      });
      fetchCsrfToken();
    }
  };

  return (
    <ThemeProvider user={user}>
      <div className="app-container outreacio-app">
        <Header 
          currentView={currentView}
          onNavigateView={navigateToView}
          onToggleView={() => {
            if (currentView === 'dashboard') {
              document.title = 'Outreacio | Campaign Dashboard';
              if (!window.location.pathname.includes('/dashboard')) {
                window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
              }
            } else if (currentView === 'pricing') {
              document.title = 'Outreacio | Pricing';
              if (!window.location.pathname.includes('/pricing')) {
                window.history.pushState({ view: 'pricing' }, '', '/pricing');
              }
            } else {
              document.title = 'Outreacio | Campaign Dashboard';
              if (!window.location.pathname.includes('/dashboard')) {
                window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
              }
            }
            return currentView === 'dashboard' ? 'landing' : 'dashboard';
          }}
          onOpenHelp={() => setIsHelpOpen(true)}
          onResetAll={handleResetAll}
          user={user}
          onLogout={handleLogout}
          onRequireAuth={() => navigateToView('login')}
        />

        <DeliverabilityModal 
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />

        {isTransitioning ? (
          <PageTransitionLoader targetView={transitionTarget} />
        ) : (
          <>
            {currentView === 'login' && (
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigateToView('landing')}
              />
            )}

            {currentView === 'landing' && (
              <LandingPage 
                onLaunchApp={handleLaunchApp} 
                onNavigateContact={() => navigateToView('contact')}
              />
            )}

            {currentView === 'contact' && (
              <ContactPage 
                onLaunchApp={handleLaunchApp} 
              />
            )}

            {currentView === 'pricing' && (
              <PricingPage 
                onUpgrade={() => {}}
                onNavigateLogin={() => navigateToView('login')}
                onNavigateDashboard={() => navigateToView('dashboard')}
                user={user}
                csrfToken={csrfToken}
              />
            )}

            {currentView === 'admin-payments' && (
              <AdminPaymentsPage onNavigateHome={() => navigateToView('landing')} />
            )}

            {currentView === 'notfound' && (
              <NotFoundPage 
                onNavigateHome={() => navigateToView('landing')}
                onNavigateContact={() => navigateToView('contact')}
              />
            )}

            {(currentView === 'dashboard' || currentView === 'app') && (
              (!authLoading && !user) ? (
              <LoginPage 
                onLoginSuccess={handleLoginSuccess}
                onNavigateHome={() => navigateToView('landing')}
              />
            ) : (
            <main style={{
              maxWidth: '960px',
              margin: '0 auto',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '32px 16px 60px'
            }}>
          {/* Top-Level Dashboard Navigation Tabs (New Campaign vs History) */}
          <div className="dashboard-top-tabs" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px'
          }}>
            <div style={{
              display: 'inline-flex',
              background: 'var(--bg-surface)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setDashboardTab('campaign')}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: dashboardTab === 'campaign' ? 'var(--bg-white)' : 'transparent',
                  color: dashboardTab === 'campaign' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: dashboardTab === 'campaign' ? '700' : '500',
                  fontSize: '14px',
                  boxShadow: dashboardTab === 'campaign' ? '0 2px 8px rgba(37, 31, 25, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>New Campaign</span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardTab('history')}
                style={{
                  padding: '8px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: dashboardTab === 'history' ? 'var(--bg-white)' : 'transparent',
                  color: dashboardTab === 'history' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: dashboardTab === 'history' ? '700' : '500',
                  fontSize: '14px',
                  boxShadow: dashboardTab === 'history' ? '0 2px 8px rgba(37, 31, 25, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>History</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Active 4-Step Wizard Flow */}
          {dashboardTab === 'campaign' && (
            <div className="animate-fade-in">
              {/* Guided Step Stepper */}
              <WizardStepper 
                currentStep={wizardStep}
                onStepClick={handleStepClick}
                isStepCompleted={isStepCompleted}
                isSending={isSending}
              />

              {/* Step 1: Connect Gmail */}
              {wizardStep === 1 && (
                <div className="animate-fade-in">
                  <SmtpConfigCard 
                    config={smtpConfig}
                    onChange={setSmtpConfig}
                    csrfToken={csrfToken}
                    isVerified={isGmailVerified}
                    onVerifiedChange={setIsGmailVerified}
                    onContinue={handleNextStep}
                  />
                </div>
              )}

              {/* Step 2: Add Recipients */}
              {wizardStep === 2 && (
                <div className="animate-fade-in">
                  <RecipientManager 
                    recipients={recipients}
                    onUpdateRecipients={setRecipients}
                    onBack={handlePrevStep}
                    onContinue={handleNextStep}
                    isStepValid={isStep2Valid}
                  />
                </div>
              )}

              {/* Step 3: Write Email */}
              {wizardStep === 3 && (
                <div className="animate-fade-in">
                  <EmailComposer 
                    subject={subject}
                    onSubjectChange={setSubject}
                    bodyHtml={bodyHtml}
                    onBodyHtmlChange={setBodyHtml}
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                    recipients={recipients}
                    onBack={handlePrevStep}
                    onContinue={handleNextStep}
                    isStepValid={isStep3Valid}
                  />
                </div>
              )}

              {/* Step 4: Review & Send */}
              {wizardStep === 4 && (
                <div className="animate-fade-in">
                  <CampaignMonitor 
                    smtpConfig={smtpConfig}
                    subject={subject}
                    bodyHtml={bodyHtml}
                    attachments={attachments}
                    recipients={recipients}
                    throttleDelay={throttleDelay}
                    onThrottleChange={setThrottleDelay}
                    jobState={jobState}
                    onStartCampaign={handleStartCampaign}
                    onCancelCampaign={handleCancelCampaign}
                    onBack={handlePrevStep}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Supabase-Backed Campaign History */}
          {dashboardTab === 'history' && (
            <div className="animate-fade-in">
              <CampaignHistory 
                csrfToken={csrfToken}
                onSwitchToNewCampaign={() => setDashboardTab('campaign')}
              />
            </div>
          )}
        </main>
          )
          )}
        </>
      )}
      </div>
    </ThemeProvider>
  );
}
