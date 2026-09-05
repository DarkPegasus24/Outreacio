import React, { useState, useEffect, useRef } from 'react';
import PlanCard from './PlanCard';
import { submitUpiPaymentProof, upgradePlan } from '../api/planService.js';

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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease',
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--bg-white, #fff)',
        borderRadius: '24px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: step === 'plans' ? '1000px' : '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '36px',
        position: 'relative',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '22px', color: 'var(--text-secondary)', lineHeight: 1,
        }}>✕</button>

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
          <>
            <button onClick={() => setStep('plans')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary, #6366f1)', fontWeight: '600', fontSize: '14px', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ← Back to plans
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800' }}>
              Pay via UPI — {selectedPlan.name} Plan
            </h2>
            <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              Complete the payment using any UPI app (GPay, PhonePe, Paytm), then submit your UTR reference and screenshot below for manual verification.
            </p>

            {/* UPI Payment Instructions Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              border: '1.5px solid #bae6fd',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '22px',
              fontSize: '13.5px',
              color: '#0369a1',
              lineHeight: 1.7
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>📱 Manual UPI Transfer</span>
                <span style={{
                  background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: '800',
                  padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase'
                }}>
                  Bridge System
                </span>
              </div>
              <div>UPI ID: <strong style={{ userSelect: 'all', background: 'rgba(2, 132, 199, 0.1)', padding: '2px 6px', borderRadius: '6px' }}>outreacio@upi</strong></div>
              <div>Amount to Pay: <strong>${selectedPlan.priceMonthly} USD (or equivalent INR ₹{selectedPlan.priceINR || Math.round(selectedPlan.priceMonthly * 85)})</strong></div>
              <div style={{ fontSize: '12px', color: '#075985', marginTop: '6px' }}>
                ✓ No payment gateway fees &bull; Instant human verification &bull; Receipt emailed upon approval
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', fontWeight: '600' }}>
                  Your Name
                  <input
                    type="text" value={payerName} onChange={e => setPayerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={inputStyle}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', fontWeight: '600' }}>
                  Account Email *
                  <input
                    type="email" value={payerEmail} onChange={e => setPayerEmail(e.target.value)}
                    placeholder="e.g. rahul@company.com"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13.5px', fontWeight: '600' }}>
                UPI Transaction UTR / Reference Number *
                <input
                  type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. 426583091234 or 12-digit bank UTR"
                  style={inputStyle}
                />
              </label>

              {/* Screenshot File Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>
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
                    border: '2px dashed var(--border-strong, #ccc)',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: screenshotPreview ? 'rgba(37,31,25,0.02)' : 'var(--bg-surface)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {screenshotPreview ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                      />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {screenshotFile?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--primary, #6366f1)', fontWeight: '600', marginTop: '2px' }}>
                          Click to change screenshot
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>📸</div>
                      <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Click to upload payment screenshot
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        PNG, JPG, or WebP up to 10MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && <p style={{ margin: 0, color: '#ef4444', fontSize: '13px', fontWeight: '500' }}>⚠️ {error}</p>}

              <button
                onClick={handleSubmitProof}
                disabled={submitting}
                style={{
                  padding: '14px', borderRadius: '12px', border: 'none',
                  background: 'var(--primary, #6366f1)', color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                  transition: 'opacity 0.2s ease',
                  marginTop: '6px'
                }}
              >
                {submitting ? 'Submitting Proof…' : `Submit Payment Proof for Verification →`}
              </button>
            </div>
          </>
        )}

        {/* ─── Step: Pending Verification Confirmation ─── */}
        {step === 'pending' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800' }}>Payment Submitted!</h2>
            <div style={{
              background: 'rgba(244, 141, 22, 0.1)',
              border: '1px solid rgba(244, 141, 22, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '14px',
              color: '#9a3412',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              Verification in Progress (Estimated: 2–4 hours)
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '28px', lineHeight: 1.7 }}>
              Thank you! Our admin team will verify your transaction against bank records. Once approved, your <strong>{selectedPlan?.name}</strong> plan features will be activated immediately and a receipt will be sent to <strong>{payerEmail}</strong>.
            </p>
            <button onClick={onClose} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary, #6366f1)', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </div>
        )}

        {/* ─── Step: Free Plan Success ─── */}
        {step === 'free_success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800' }}>You're on the Free Plan!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>
              Your account has been switched to the Free tier.
            </p>
            <button onClick={onClose} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: 'var(--primary, #6366f1)', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px 14px', borderRadius: '10px',
  border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
  fontSize: '14px', color: 'var(--text-primary)', outline: 'none',
  fontFamily: 'inherit', transition: 'border-color 0.2s ease',
};
