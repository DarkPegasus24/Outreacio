import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import FaqSection from './FaqSection';
import CtaBannerSection from './CtaBannerSection';
import { submitContactMessage } from '../api/planService';

export default function ContactPage({ onLaunchApp }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await submitContactMessage(formData);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ color: 'var(--text-primary)', paddingBottom: '40px' }}>
      {/* 1. Contact Hero & Contact Details / Form */}
      <section style={{ padding: '20px 0 60px' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 44px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Get in touch
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            lineHeight: 1.12,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '14px'
          }}>
            Let's talk outreach.<br />
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-secondary)' }}>We're here to help.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Have a question about email deliverability, Gmail setup, or pricing plans? Our team responds within 2 business hours.
          </p>
        </div>

        {/* Centered Contact Message Form */}
        <div style={{
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          <div className="parley-card" style={{ background: 'var(--bg-white)', padding: '36px', boxShadow: '0 16px 40px rgba(37, 31, 25, 0.08)' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '8px' }}>Send us a message</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Fill out the details below and we will get back to you promptly.
            </p>

            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#dc2626',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '13.5px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {formSubmitted ? (
              <div style={{
                background: 'rgba(31, 190, 109, 0.08)',
                border: '1px solid rgba(31, 190, 109, 0.25)',
                borderRadius: '12px',
                padding: '32px 20px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={40} color="#128a4d" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#128a4d', marginBottom: '8px' }}>
                  Message Received!
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                  Thank you for reaching out. We have received your inquiry and our support team will reply directly to your email address shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(37, 31, 25, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '5px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '5px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', marginBottom: '5px' }}>
                    How can we help? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your outreach volume, questions, or requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="parley-chat-btn"
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '6px',
                    padding: '5px 20px 5px 5px',
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="parley-chat-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  </div>
                  <span style={{ fontSize: '14.5px' }}>
                    {submitting ? 'Sending Message...' : 'Submit Message'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 2. Reusable FAQ Section */}
      <FaqSection onLaunchApp={onLaunchApp} />

      {/* 3. Reusable Final CTA Banner Section */}
      <CtaBannerSection onLaunchApp={onLaunchApp} />
    </div>
  );
}
