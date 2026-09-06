import React, { useState, useEffect } from 'react';
import { 
  Send, ShieldCheck, Zap, CheckCircle2, Clock, 
  ChevronDown, ArrowRight, Star, Check, X, 
  HelpCircle, Sliders, Smartphone, Monitor, Database,
  FileText, Lock, Sparkles, Mail
} from 'lucide-react';
import FaqSection from './FaqSection';
import CtaBannerSection from './CtaBannerSection';
import PlanCard from './PlanCard';
import { fetchPlans } from '../api/planService.js';
import { SkeletonPlansGrid } from './SkeletonLoader';

export default function LandingPage({ onLaunchApp, onNavigateContact }) {
  const [activeKpi, setActiveKpi] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'
  const [plans, setPlans] = useState({});
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(err => console.error('Failed to load plans on landing page', err))
      .finally(() => setPlansLoading(false));
  }, []);

  // 4 Real Working Benefit Cards (Why Outreacio)
  const kpis = [
    {
      num: '01.',
      title: 'Easy List Upload',
      desc: 'Just drag-drop your CSV or paste text. Outreacio finds emails automatically, checks them for syntax errors, and shows you exactly what will be sent.',
      icon: <FileText size={18} color="var(--accent)" />,
      badge: 'CSV & Copy-Paste',
      pill: {
        text: '124 valid emails found. Ready to send.',
        type: 'success'
      }
    },
    {
      num: '02.',
      title: 'Gmail Connection',
      desc: 'Connect your Gmail in 30 seconds using a secure App Password. One click to verify it works. Your password is never saved to disk or database.',
      icon: <ShieldCheck size={18} color="#128a4d" />,
      badge: 'Zero Storage',
      pill: {
        text: 'Gmail verified in 1 click.',
        type: 'secure'
      }
    },
    {
      num: '03.',
      title: 'Personal Touch',
      desc: 'Add names automatically with {{Company Name}}. Every email feels personal and custom-written, even when sending hundreds at once.',
      icon: <Star size={18} color="var(--accent)" />,
      badge: 'Dynamic Tags',
      pill: {
        text: 'Personalized for {{Company Name}}',
        type: 'info'
      }
    },
    {
      num: '04.',
      title: 'Watch It Happen',
      desc: 'See emails send in real-time. Live counter shows successes, failures, and timing. Download a complete delivery report when done.',
      icon: <Zap size={18} color="#2b7fff" />,
      badge: 'Live Tracker',
      pill: {
        text: '124 delivered • Real-time stream',
        type: 'live'
      }
    }
  ];

  // 4 Real Workflow Steps
  const workflowSteps = [
    {
      id: 0,
      title: 'Upload Your List',
      summary: 'Paste company emails or drag a CSV file. We check everything is correct.',
      badge: 'Step 01',
      mockup: {
        type: 'csv',
        headline: 'Clean Contact Parsing',
        snippet: 'company_name, email\nAcme Corp, alex@acme.com\nStripe, team@stripe.com\nLinear, hello@linear.app',
        highlight: '3 contacts detected with valid formats'
      }
    },
    {
      id: 1,
      title: 'Write Your Email',
      summary: 'Write one message. Add {{Company Name}} so it feels personal. See a live preview.',
      badge: 'Step 02',
      mockup: {
        type: 'composer',
        headline: 'Dynamic Personalization',
        snippet: 'Subject: Quick question for {{Company Name}}\n\nHey team at {{Company Name}},\nLoved what you guys are building...',
        highlight: 'Personalized preview updates instantly'
      }
    },
    {
      id: 2,
      title: 'Connect Gmail',
      summary: 'Connect your Gmail account (takes 30 seconds). One click tests it works.',
      badge: 'Step 03',
      mockup: {
        type: 'gmail',
        headline: '1-Click Gmail Verification',
        snippet: 'Email: alex@gmail.com\nApp Password: ••••••••••••••••\nStatus: Verified Active Connection',
        highlight: 'In-memory security: zero password storage'
      }
    },
    {
      id: 3,
      title: 'Send & Watch Live',
      summary: 'Set your sending speed. Hit Send. Watch live progress and download results.',
      badge: 'Step 04',
      mockup: {
        type: 'monitor',
        headline: 'Live Campaign Tracking',
        snippet: 'Pacing: 2.5s delay per email\nProgress: 48 / 50 sent (96%)\nStatus: 100% Primary Inbox Delivery',
        highlight: 'Live counter stream with CSV export'
      }
    }
  ];

  return (
    <div className="animate-fade-in" style={{ color: 'var(--text-primary)' }}>
      {/* 1. Cinematic Hero Banner */}
      <section className="parley-hero-banner animate-fade-in">
        <div className="parley-hero-overlay" />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px', margin: '0 auto' }}>
          <h1 className="parley-hero-title">
            <span className="hero-title-desktop">
              The bulk sender<br />
              that works <span className="parley-hero-italic">with</span><br />
              <span className="parley-hero-italic">you</span>, not just for you
            </span>
            <span className="hero-title-mobile">
              The bulk sender<br />
              that works<br />
              <span className="parley-hero-italic">with you</span>, not<br />
              just for you
            </span>
          </h1>

          <p className="parley-hero-subtitle">
            <span className="hero-sub-desktop">
              Outreacio thinks, plans, and acts alongside you | handling<br />
              emails, scheduling, and live workflows<br />
              so you can focus on the work only you can do.
            </span>
            <span className="hero-sub-mobile">
              Outreacio thinks, plans, and acts alongside you | handling emails, scheduling, and live workflows so you can focus on the work only you can do.
            </span>
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onLaunchApp} className="parley-hero-cta-btn">
              <div className="parley-hero-cta-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
              <span>Get started free</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Why Outreacio (Exact Parley 4-Card Pixel-Art Design) */}
      <section id="benefits" style={{ padding: '60px 0 30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          alignItems: 'flex-start',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Why Outreacio
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              lineHeight: 1.12,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em'
            }}>
              A real partner,<br />
              not a chatbot in<br />
              disguise
            </h2>
          </div>

          <div>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '520px', marginTop: '30px' }}>
              Most bulk senders are overly complicated and get your emails flagged as spam. Outreacio keeps it simple: connect Gmail, customize with names, pace your sending, and track everything live.
            </p>
          </div>
        </div>

        {/* Desktop 4 Parley-Style Interactive Cards Grid */}
        <div className="parley-kpi-grid parley-kpi-grid-desktop">
          {kpis.map((kpi, idx) => {
            const isActive = activeKpi === idx;

            if (isActive) {
              // Active / Expanded White Card (as in screenshot left card)
              return (
                <div
                  key={idx}
                  onClick={() => setActiveKpi(idx)}
                  className="parley-card-active"
                >
                  {/* Top Textured Canvas Box with Notification Pill */}
                  <div className="parley-card-canvas">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#f48d16',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800',
                        boxShadow: '0 3px 8px rgba(244, 141, 22, 0.35)',
                        flexShrink: 0
                      }}>
                        ?
                      </div>

                      <div style={{
                        background: 'var(--bg-white)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-card)',
                        border: '1px solid var(--border)',
                        lineHeight: 1.3
                      }}>
                        {kpi.pill.text}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Area: 2-Line Bold Title & Description */}
                  <div style={{ padding: '0 8px' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.45rem',
                      fontWeight: 700,
                      lineHeight: 1.18,
                      color: 'var(--text-primary)',
                      marginBottom: '10px'
                    }}>
                      {kpi.title}
                    </h3>
                    <p style={{
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0
                    }}>
                      {kpi.desc}
                    </p>
                  </div>
                </div>
              );
            }

            // Inactive Beige Card with Huge Number & Pixel Art
            return (
              <div
                key={idx}
                onClick={() => setActiveKpi(idx)}
                onMouseEnter={() => setActiveKpi(idx)}
                className="parley-card-inactive"
              >
                {/* Top: Faint Number */}
                <div className="parley-card-number">
                  {kpi.num}
                </div>

                {/* Center: Geometric Scattered Pixel Art */}
                <div style={{ position: 'relative', width: '100%', height: '180px', margin: 'auto 0' }}>
                  {idx === 0 && (
                    <>
                      <div style={{ position: 'absolute', top: '35%', left: '68%', width: '16px', height: '16px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '55%', width: '16px', height: '16px', background: '#f0ceaa', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '60%', left: '76%', width: '16px', height: '16px', background: '#fae0c7', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '66%', left: '38%', width: '16px', height: '16px', background: '#f3ab66', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '62%', width: '16px', height: '16px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '78%', left: '26%', width: '16px', height: '16px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '78%', width: '16px', height: '16px', background: '#f29e4b', borderRadius: '2px' }} />
                    </>
                  )}

                  {idx === 1 && (
                    <>
                      <div style={{ position: 'absolute', top: '35%', left: '68%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '58%', width: '17px', height: '17px', background: '#f0ceaa', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '60%', left: '78%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '66%', left: '38%', width: '17px', height: '17px', background: '#f3ab66', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '62%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '77%', left: '28%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '80%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                    </>
                  )}

                  {idx === 2 && (
                    <>
                      <div style={{ position: 'absolute', top: '35%', left: '70%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '35%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '56%', left: '60%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '60%', left: '80%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '62%', left: '25%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '15%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '40%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '71%', left: '50%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '66%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '83%', left: '46%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '80%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                    </>
                  )}

                  {idx === 3 && (
                    <>
                      <div style={{ position: 'absolute', top: '35%', left: '78%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '46%', left: '50%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '78%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '60%', left: '90%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '65%', left: '60%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '74%', left: '75%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '33%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '63%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: '88%', left: '88%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                    </>
                  )}
                </div>

                {/* Bottom: Clean Single-Line Title */}
                <h4 style={{
                  fontSize: '1.15rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.3
                }}>
                  {kpi.title}
                </h4>
              </div>
            );
          })}
        </div>

        {/* Mobile 4 Cards View: Every Card rendered in full static design with zero animation */}
        <div className="parley-kpi-grid-mobile">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="parley-mobile-kpi-card">
              {/* Top Textured Canvas Box with Notification Pill */}
              <div className="parley-card-canvas">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '92%' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: '#f48d16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    boxShadow: '0 3px 8px rgba(244, 141, 22, 0.35)',
                    flexShrink: 0
                  }}>
                    ?
                  </div>

                  <div className="parley-card-pill-inner" style={{
                    background: 'var(--bg-white)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid var(--border)',
                    lineHeight: 1.3
                  }}>
                    {kpi.pill.text}
                  </div>
                </div>
              </div>

              {/* Bottom Area: Bold Title & Description */}
              <div style={{ padding: '4px 6px 0' }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  lineHeight: 1.18,
                  color: 'var(--text-primary)',
                  marginBottom: '10px'
                }}>
                  {kpi.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  margin: 0
                }}>
                  {kpi.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works (4-Step Vertical Interactive Workflow) */}
      <section id="how-it-works-sec" style={{ padding: '60px 0 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Workflows
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
            lineHeight: 1.15,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '12px'
          }}>
            How Outreacio Works
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Four simple steps from raw contact list to personalized inboxes.
          </p>
        </div>

        {/* 2-Column Split: 4-Step List Left, Live Preview Right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center',
          maxWidth: '1080px',
          margin: '0 auto'
        }}>
          {/* Left: 4-Step Vertical Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workflowSteps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  onMouseEnter={() => setActiveStep(idx)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: isActive ? 'var(--bg-white)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                    boxShadow: isActive ? '0 8px 24px rgba(37, 31, 25, 0.06)' : 'none',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isActive ? '#f48d16' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    border: `1px solid ${isActive ? '#f48d16' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '13px',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 0.2s'
                  }}>
                    {isActive ? '»' : `0${idx + 1}`}
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        transition: 'color 0.2s'
                      }}>
                        {step.title}
                      </h4>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {step.badge}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13.5px',
                      color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)',
                      lineHeight: 1.5,
                      margin: 0
                    }}>
                      {step.summary}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Interactive Step Preview Card */}
          <div className="parley-card" style={{
            background: 'var(--bg-white)',
            padding: '30px',
            minHeight: '340px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 16px 40px rgba(37, 31, 25, 0.08)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  background: 'rgba(244, 141, 22, 0.12)',
                  color: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  {workflowSteps[activeStep].badge} Preview
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Live Mockup</span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '14px' }}>
                {workflowSteps[activeStep].mockup.headline}
              </h3>

              <pre style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                margin: '0 0 16px'
              }}>
                {workflowSteps[activeStep].mockup.snippet}
              </pre>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '14px',
              borderTop: '1px solid var(--border)',
              fontSize: '12.5px',
              color: 'var(--text-secondary)'
            }}>
              <span>✓ {workflowSteps[activeStep].mockup.highlight}</span>
              <button
                onClick={onLaunchApp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Try this step &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing (Exact 2-Card Layout matching Pricing Page & User Screenshot) */}
      <section id="pricing" style={{ padding: '60px 20px 40px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent, #f48d16)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
          SIMPLE, HONEST PRICING
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 4.8vw, 3.2rem)',
          lineHeight: 1.15,
          fontWeight: 700,
          marginBottom: '16px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          maxWidth: '720px',
          margin: '0 auto 16px'
        }}>
          Scale your email outreach<br />without scaling your costs
        </h2>
        <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          Start free. Upgrade when you need higher sending capacity. No surprise charges | ever.
        </p>

        {/* Currency Switcher Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '4px',
          gap: '4px',
          marginBottom: '44px'
        }}>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: currency === 'USD' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🇺🇸 USD ($)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrency('INR')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: currency === 'INR' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🇮🇳 INR (₹)</span>
          </button>
        </div>

        {/* 2 Plans Grid */}
        <div style={{
          display: 'flex',
          gap: '28px',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {/* Card 1: FREE TIER */}
          <div style={{
            flex: '1 1 320px',
            maxWidth: '390px',
            minWidth: '290px',
            background: 'var(--bg-white)',
            border: '1.5px solid var(--border)',
            borderRadius: '24px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'left',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}>
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                FREE TIER
              </div>

              <h3 style={{
                fontSize: '38px',
                fontWeight: '900',
                color: 'var(--text-primary)',
                margin: '0 0 4px',
                lineHeight: 1
              }}>
                Free
              </h3>

              <p style={{
                fontSize: '13.5px',
                color: 'var(--text-secondary)',
                margin: '0 0 28px'
              }}>
                Free forever · No card needed
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="8" fill="var(--accent, #f48d16)" opacity="0.18" />
                    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--accent, #f48d16)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>1 Connected Inbox (Gmail)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="8" fill="var(--accent, #f48d16)" opacity="0.18" />
                    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--accent, #f48d16)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>25 emails / day</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLaunchApp}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-white)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent, #f48d16)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Get Started Free
            </button>
          </div>

          {/* Card 2: PAID PLAN (Most Popular) */}
          <div style={{
            flex: '1 1 320px',
            maxWidth: '390px',
            minWidth: '290px',
            position: 'relative',
            background: 'linear-gradient(145deg, #f48d16 0%, #e07d0a 100%)',
            borderRadius: '24px',
            padding: '32px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 50px rgba(244, 141, 22, 0.35)',
            textAlign: 'left',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}>
            {/* Top Floating Badge */}
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#251f19',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '5px 18px',
              borderRadius: '9999px',
              boxShadow: '0 4px 14px rgba(37, 31, 25, 0.3)',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              MOST POPULAR
            </div>

            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '0.08em',
                color: 'rgba(255, 255, 255, 0.85)',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                PAID PLAN
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>
                  {currency === 'USD' ? '$4.99' : '₹425'}
                </span>
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                  /mo
                </span>
              </div>

              <p style={{
                fontSize: '12.5px',
                color: 'rgba(255, 255, 255, 0.82)',
                margin: '0 0 28px',
                fontWeight: '500'
              }}>
                {currency === 'USD' ? '~ ₹425 INR / month' : '~ $4.99 USD / month'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#ffffff' }}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="8" fill="#ffffff" opacity="0.25" />
                    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>1 Connected Inbox (Gmail)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#ffffff' }}>
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="8" fill="#ffffff" opacity="0.25" />
                    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>150 emails / day</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLaunchApp}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                background: '#ffffff',
                color: '#251f19',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
              }}
            >
              Upgrade to Paid Plan
            </button>
          </div>
        </div>
      </section>

      {/* 5. Reusable FAQ Section */}
      <FaqSection onLaunchApp={onLaunchApp} onOpenContactForm={onNavigateContact} />

      {/* 6. Integrations (Gmail / Google Workspace Exclusive) */}
      <section style={{ padding: '40px 0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Integrations
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
          Works seamlessly with your email infrastructure
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
          Direct native connection with zero third-party middleware required.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 6px 20px rgba(37, 31, 25, 0.06)',
            maxWidth: '480px',
            textAlign: 'left'
          }}>
            {/* Crisp Professional Gmail Icon Container */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="18" viewBox="0 0 24 19" fill="none">
                <path d="M1.5 3.5V15.5C1.5 16.6 2.4 17.5 3.5 17.5H5.5V7.5L12 12L18.5 7.5V17.5H20.5C21.6 17.5 22.5 16.6 22.5 15.5V3.5C22.5 2.1 20.9 1.3 19.8 2.1L12 7.5L4.2 2.1C3.1 1.3 1.5 2.1 1.5 3.5Z" fill="#EA4335"/>
                <path d="M1.5 3.5V15.5C1.5 16.6 2.4 17.5 3.5 17.5H5.5V7.5L1.5 4.5V3.5Z" fill="#4285F4"/>
                <path d="M22.5 3.5V15.5C22.5 16.6 21.6 17.5 20.5 17.5H18.5V7.5L22.5 4.5V3.5Z" fill="#34A853"/>
                <path d="M18.5 17.5H5.5V7.5L12 12L18.5 7.5V17.5Z" fill="#FBBC05"/>
              </svg>
            </div>

            {/* Label & Details */}
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Gmail &amp; Google Workspace</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Direct Connection &bull; App Passwords &bull; TLS 1.3
              </div>
            </div>

            {/* Verified Badge */}
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid var(--success-border)',
              padding: '4px 10px',
              borderRadius: '9999px',
              flexShrink: 0
            }}>
              ✓ Native Verified
            </div>
          </div>
        </div>
      </section>

      {/* 7. Reusable Final CTA Banner Section */}
      <CtaBannerSection onLaunchApp={onLaunchApp} />
    </div>
  );
}
