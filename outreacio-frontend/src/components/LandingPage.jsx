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
  const [plans, setPlans] = useState({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'

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
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5.8vw, 4.2rem)',
            lineHeight: 1.1,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            textShadow: '0 3px 18px rgba(0, 0, 0, 0.45)'
          }}>
            The bulk sender that works with you,<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>not just for you</span>
          </h1>

          <p style={{
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: 'clamp(1.05rem, 2.2vw, 1.22rem)',
            maxWidth: '620px',
            margin: '0 auto 28px',
            lineHeight: 1.6,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.35)'
          }}>
            Send personalized emails to hundreds of companies in minutes. No copy-paste. No spam flags. Just smart, fast outreach.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onLaunchApp} className="parley-chat-btn">
              <div className="parley-chat-icon">
                &gt;
              </div>
              <span>Get started now</span>
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

        {/* 4 Parley-Style Cards Grid */}
        <div className="parley-kpi-grid">
          {kpis.map((kpi, idx) => {
            const isActive = activeKpi === idx;

            if (isActive) {
              // Active / Expanded White Card (as in screenshot left card)
              return (
                <div
                  key={idx}
                  onClick={() => setActiveKpi(idx)}
                  className="parley-card-active animate-fade-in"
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
                        background: '#ffffff',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        color: '#251f19',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
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

                {/* Center: Geometric Scattered Pixel Art (Exact Match to Image) */}
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

                  {/* Card 02: Exact Blocks from Reference Image */}
                  {idx === 1 && (
                    <>
                      {/* Top right dark orange */}
                      <div style={{ position: 'absolute', top: '35%', left: '68%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Below top right peach */}
                      <div style={{ position: 'absolute', top: '50%', left: '58%', width: '17px', height: '17px', background: '#f0ceaa', borderRadius: '2px' }} />
                      {/* Right pale peach */}
                      <div style={{ position: 'absolute', top: '60%', left: '78%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      {/* Mid left step */}
                      <div style={{ position: 'absolute', top: '66%', left: '38%', width: '17px', height: '17px', background: '#f3ab66', borderRadius: '2px' }} />
                      {/* Lower mid orange */}
                      <div style={{ position: 'absolute', top: '74%', left: '62%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Far left bottom tan */}
                      <div style={{ position: 'absolute', top: '77%', left: '28%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      {/* Far right bottom orange */}
                      <div style={{ position: 'absolute', top: '88%', left: '80%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                    </>
                  )}

                  {/* Card 03: Exact Blocks from Reference Image */}
                  {idx === 2 && (
                    <>
                      {/* Top right dark orange */}
                      <div style={{ position: 'absolute', top: '35%', left: '70%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Mid-top center dark orange */}
                      <div style={{ position: 'absolute', top: '50%', left: '35%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Center-right dark orange */}
                      <div style={{ position: 'absolute', top: '56%', left: '60%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Right pale peach */}
                      <div style={{ position: 'absolute', top: '60%', left: '80%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      {/* Mid-left step */}
                      <div style={{ position: 'absolute', top: '62%', left: '25%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      {/* Bottom-left tan */}
                      <div style={{ position: 'absolute', top: '74%', left: '15%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      {/* Lower center tan */}
                      <div style={{ position: 'absolute', top: '74%', left: '40%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      {/* Lower center pale peach */}
                      <div style={{ position: 'absolute', top: '71%', left: '50%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      {/* Lower right orange */}
                      <div style={{ position: 'absolute', top: '74%', left: '66%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      {/* Bottom center tan */}
                      <div style={{ position: 'absolute', top: '83%', left: '46%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      {/* Far bottom right orange */}
                      <div style={{ position: 'absolute', top: '88%', left: '80%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                    </>
                  )}

                  {/* Card 04: Exact Blocks from Reference Image */}
                  {idx === 3 && (
                    <>
                      {/* Top right dark orange */}
                      <div style={{ position: 'absolute', top: '35%', left: '78%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Mid-top left orange */}
                      <div style={{ position: 'absolute', top: '46%', left: '50%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      {/* Below top right tan */}
                      <div style={{ position: 'absolute', top: '50%', left: '78%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      {/* Right pale peach */}
                      <div style={{ position: 'absolute', top: '60%', left: '90%', width: '17px', height: '17px', background: '#fae0c7', borderRadius: '2px' }} />
                      {/* Center step tan */}
                      <div style={{ position: 'absolute', top: '65%', left: '60%', width: '17px', height: '17px', background: '#f0ae6b', borderRadius: '2px' }} />
                      {/* Lower right dark orange */}
                      <div style={{ position: 'absolute', top: '74%', left: '75%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Bottom left dark orange */}
                      <div style={{ position: 'absolute', top: '88%', left: '33%', width: '17px', height: '17px', background: '#f48d16', borderRadius: '2px' }} />
                      {/* Bottom center orange */}
                      <div style={{ position: 'absolute', top: '88%', left: '63%', width: '17px', height: '17px', background: '#f29e4b', borderRadius: '2px' }} />
                      {/* Bottom right tan */}
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
                    background: isActive ? '#f48d16' : '#eeede7',
                    color: isActive ? '#ffffff' : '#251f19',
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
                        color: isActive ? 'var(--text-primary)' : 'rgba(37, 31, 25, 0.75)'
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

      {/* 4. Pricing (Dynamic Plan Grid: Free Tier & $4.99 Paid Plan) */}
      <section id="pricing" style={{ padding: '60px 20px 40px', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
          Pricing
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
          lineHeight: 1.15,
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          Simple &amp; Transparent
        </h2>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '520px', margin: '0 auto 24px' }}>
          Start free. Upgrade whenever you're ready. No hidden fees or surprise charges — ever.
        </p>

        {/* Currency Switcher Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '4px',
          marginBottom: '36px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              border: 'none',
              background: currency === 'USD' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              padding: '6px 16px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇺🇸 USD ($)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('INR')}
            style={{
              border: 'none',
              background: currency === 'INR' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              padding: '6px 16px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇮🇳 INR (₹)
          </button>
        </div>

        {plansLoading ? (
          <SkeletonPlansGrid />
        ) : (
          <div style={{
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'stretch',
            marginBottom: '32px',
            maxWidth: '780px',
            marginInline: 'auto'
          }}>
            {Object.entries(plans)
              .filter(([key]) => key === 'free' || key === 'pro')
              .map(([key, plan]) => (
                <PlanCard
                  key={key}
                  planKey={key}
                  plan={plan}
                  currency={currency}
                  isPopular={key === 'pro'}
                  isCurrentPlan={false}
                  onUpgradeClick={() => onLaunchApp()}
                />
            ))}
          </div>
        )}
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
              background: '#f8f7f4',
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
              background: 'rgba(31, 190, 109, 0.12)',
              color: '#128a4d',
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
