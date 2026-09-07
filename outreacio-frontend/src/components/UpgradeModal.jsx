import React, { useState, useEffect, useRef } from 'react';
import PlanCard from './PlanCard';
import { submitUpiPaymentProof, upgradePlan } from '../api/planService.js';
import { X, ArrowLeft, UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, Sparkles, Clock } from 'lucide-react';

export default function UpgradeModal({ isOpen, onClose, currentPlanId, plans = {}, initialPlanKey = 'pro', csrfToken, onUpgradeSuccess }) {
  const [step, setStep] = useState('payment'); // 'plans' | 'payment' | 'pending' | 'free_success'
  const [selectedPlanKey, setSelectedPlanKey] = useState(initialPlanKey || 'pro');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Reset & prepare plan when modal opens
  useEffect(() => {
    if (isOpen) {
      const planKey = initialPlanKey || 'pro';
      const plan = plans[planKey] || {
        name: 'Paid Plan',
        priceMonthly: 4.99,
        priceINR: 425,
      };

      setSelectedPlanKey(planKey);
      setSelectedPlan(plan);
      setStep('payment');
      setPayerName('');
      setPayerEmail('');
      setPaymentRef('');
      setScreenshotFile(null);
      setScreenshotPreview('');
      setError('');
    }
  }, [isOpen, initialPlanKey, plans]);

  if (!isOpen) return null;

  const handleSelectPlan = (planKey, plan) => {
    if (plan.priceMonthly === 0) {
      // Free plan: upgrade directly with no payment form
      handleFreeUpgrade(planKey);
      return;
    }
    setSelectedPlanKey(planKey);
    setSelectedPlan(plan);
    setPaymentRef('');
    setScreenshotFile(null);
    setScreenshotPreview('');
    setError('');
    setStep('payment');
  };

  const handleFreeUpgrade = async (planKey) => {
    setSubmitting(true);
    try {
      const result = await upgradePlan(planKey, {}, csrfToken);
      if (result.success) {
        setStep('free_success');
        if (onUpgradeSuccess) onUpgradeSuccess(result);
      } else {
        setError(result.error || 'Upgrade failed.');
      }
    } catch (err) {
      setError(err.message || 'Upgrade failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setScreenshotFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!paymentRef.trim()) {
      setError('Please enter your 12-digit transaction UTR / UPI reference number.');
      return;
    }

    if (!payerEmail.trim()) {
      setError('Please enter your email so we can link your account.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('planId', selectedPlanKey);
      formData.append('utr_reference', paymentRef.trim());
      formData.append('payer_name', payerName.trim());
      formData.append('payer_email', payerEmail.trim());
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const result = await submitUpiPaymentProof(formData, csrfToken);
      if (result.success) {
        setStep('pending');
        if (onUpgradeSuccess) onUpgradeSuccess({ message: 'Payment submitted for review' });
      } else {
        setError(result.error || 'Submission failed. Please check details.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid "Paid Plan Plan" duplication
  const planDisplayName = selectedPlan?.name
    ? (selectedPlan.name.toLowerCase().includes('plan') ? selectedPlan.name : `${selectedPlan.name} Plan`)
    : 'Paid Plan';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        width: '100%',
        maxWidth: step === 'plans' ? '1000px' : (step === 'payment' ? '880px' : '520px'),
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '32px 30px',
        position: 'relative',
        animation: 'slideUp 0.25s ease',
        color: 'var(--text-primary)'
      }}>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: '18px', right: '18px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--bg-surface)',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-surface-hover, var(--border))';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={16} />
        </button>

        {/* ─── Step: Plans ─── */}
        {step === 'plans' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '800' }}>Choose a Plan</h2>
            <p style={{ margin: '0 0 28px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              Select a plan below to pay via UPI. Payments are manually verified and activated within 2–4 hours.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Object.entries(plans)
                .filter(([key]) => key === 'free' || key === 'pro')
                .map(([key, plan]) => (
                <PlanCard
                  key={key}
                  planKey={key}
                  plan={plan}
                  isPopular={key === 'pro'}
                  isCurrentPlan={key === currentPlanId}
                  onUpgradeClick={handleSelectPlan}
                />
              ))}
            </div>
          </>
        )}

        {/* ─── Step: Payment Form ─── */}
        {step === 'payment' && selectedPlan && (
          <div className="upgrade-modal-grid">
            {/* Left Column: Title, Description, and Instructions */}
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Pay via UPI | {planDisplayName}
              </h2>
              <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                Complete the payment using any UPI app (GPay, PhonePe, Paytm), then submit your UTR reference and screenshot for manual verification.
              </p>

              {/* UPI Payment Instructions Box */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--accent-border, rgba(244, 141, 22, 0.3))',
                borderRadius: '18px',
                padding: '18px 20px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: '800', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <FileText size={16} color="var(--accent, #f48d16)" />
                    How Payment Works
                  </span>
                  <span style={{
                    background: 'var(--accent, #f48d16)', color: '#ffffff', fontSize: '10.5px', fontWeight: '800',
                    padding: '3px 10px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.04em',
                    boxShadow: '0 2px 8px rgba(244, 141, 22, 0.3)'
                  }}>
                    Manual Review
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                  <div>1. Fill in your name, account email, and the UPI transaction reference (UTR).</div>
                  <div>2. Upload a clear screenshot of your payment confirmation.</div>
                  <div>3. Our team will verify your submission and activate features within 2–4 hours.</div>
                </div>

                <div style={{
                  marginTop: '14px',
                  padding: '10px 12px',
                  background: 'var(--accent-light, rgba(244, 141, 22, 0.12))',
                  border: '1px solid var(--accent-border, rgba(244, 141, 22, 0.25))',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <span style={{ color: 'var(--accent, #f48d16)', fontWeight: '900' }}>✓</span>
                  <span>Amount: <strong>${selectedPlan.priceMonthly} USD</strong> / <strong>₹{selectedPlan.priceINR || Math.round(selectedPlan.priceMonthly * 85)} INR</strong></span>
                  <span style={{ opacity: 0.5 }}>•</span>
                  <span>Manual human verification</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form Inputs, Screenshot Upload, and Submit Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Your Name
                  <input
                    type="text" value={payerName} onChange={e => setPayerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Account Email *
                  <input
                    type="email" value={payerEmail} onChange={e => setPayerEmail(e.target.value)}
                    placeholder="e.g. rahul@company.com"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                UPI Transaction UTR / Reference Number *
                <input
                  type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 426583091234 or 12-digit bank UTR"
                  style={inputStyle}
                />
              </label>

              {/* Screenshot File Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>
                  Payment Screenshot Proof *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-strong, var(--border))',
                    borderRadius: '14px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: screenshotPreview ? 'var(--accent-light, rgba(244, 141, 22, 0.04))' : 'var(--bg-surface)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent, #f48d16)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-strong, var(--border))';
                  }}
                >
                  {screenshotPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1.5px solid var(--accent, #f48d16)' }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {screenshotFile?.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--accent, #f48d16)', fontWeight: '700', marginTop: '2px' }}>
                          Click to replace screenshot
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--accent-light, rgba(244, 141, 22, 0.15))',
                        color: 'var(--accent, #f48d16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2px'
                      }}>
                        <UploadCloud size={20} />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Click to upload payment screenshot
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        PNG, JPG, or WebP up to 10MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--error-bg, rgba(226, 75, 74, 0.12))',
                  border: '1px solid var(--error-border, rgba(226, 75, 74, 0.35))',
                  color: 'var(--error, #e24b4a)', padding: '10px 14px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: '600'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitProof}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 100%)',
                  color: '#ffffff',
                  fontSize: '14.5px',
                  fontWeight: '800',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: '0 8px 24px rgba(244, 141, 22, 0.35)',
                  transition: 'all 0.2s ease',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  if (!submitting) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(244, 141, 22, 0.45)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 141, 22, 0.35)';
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Submitting Proof…</span>
                  </>
                ) : (
                  <span>Submit Payment Proof for Verification →</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step: Pending Verification Confirmation ─── */}
        {step === 'pending' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--accent-light, rgba(244, 141, 22, 0.15))',
              color: 'var(--accent, #f48d16)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 18px'
            }}>
              <Clock size={32} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>Payment Submitted!</h2>
            <div style={{
              background: 'var(--accent-light, rgba(244, 141, 22, 0.12))',
              border: '1px solid var(--accent-border, rgba(244, 141, 22, 0.35))',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '13.5px',
              color: 'var(--accent, #f48d16)',
              fontWeight: '700',
              marginBottom: '20px',
              display: 'inline-block'
            }}>
              Verification in Progress (Estimated: 2–4 hours)
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '28px', lineHeight: 1.7 }}>
              Thank you! Our admin team will verify your transaction against bank records. Once approved, your <strong>{selectedPlan?.name}</strong> plan features will be activated immediately and a receipt will be sent to <strong>{payerEmail}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '13px 32px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 100%)',
                color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(244, 141, 22, 0.35)'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* ─── Step: Free Plan Success ─── */}
        {step === 'free_success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--success-bg, rgba(31, 190, 109, 0.15))',
              color: 'var(--success, #1fbe6d)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 18px'
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>You're on the Free Plan!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>
              Your account has been switched to the Free tier.
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '13px 32px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 100%)',
                color: '#fff', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(244, 141, 22, 0.35)'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '12px',
  border: '1.5px solid var(--border)',
  background: 'var(--bg-surface)',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
};

