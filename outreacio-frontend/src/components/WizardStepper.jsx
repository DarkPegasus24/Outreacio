import React from 'react';
import { Check } from 'lucide-react';

export default function WizardStepper({ currentStep, onStepClick, isStepCompleted, isSending }) {
  const steps = [
    { id: 1, label: 'Connect Gmail' },
    { id: 2, label: 'Add Recipients' },
    { id: 3, label: 'Write Email' },
    { id: 4, label: 'Review & Send' }
  ];

  const currentStepObj = steps.find(s => s.id === currentStep) || steps[0];
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto 28px',
      padding: '0 8px'
    }}>
      {/* Mobile Stepper (<= 560px) */}
      <div className="stepper-mobile" style={{ display: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          <span>Step {currentStep} of {steps.length}</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{currentStepObj.label}</strong>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: '#eeede7',
          borderRadius: '9999px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentStep / steps.length) * 100}%`,
            height: '100%',
            background: 'var(--accent)',
            borderRadius: '9999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Desktop / Tablet Stepper View */}
      <div className="stepper-desktop" style={{ position: 'relative' }}>
        {/* Connecting Progress Track */}
        <div style={{
          position: 'absolute',
          top: '18px',
          left: '60px',
          right: '60px',
          height: '3px',
          background: '#e6e4dc',
          zIndex: 1,
          borderRadius: '2px'
        }}>
          {/* Active Fill Track */}
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: '#f48d16',
            borderRadius: '2px',
            transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>

        {/* 4 Step Nodes */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          {steps.map((step) => {
            const isCompleted = isStepCompleted(step.id) && step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = !isSending && (isCompleted || step.id < currentStep);

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (isClickable) onStepClick(step.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: isClickable ? 'pointer' : 'default',
                  userSelect: 'none',
                  flex: 1,
                  textAlign: 'center'
                }}
              >
                {/* Circle Badge */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  background: isCurrent ? '#f48d16' : isCompleted ? '#251f19' : '#ffffff',
                  color: isCurrent || isCompleted ? '#ffffff' : '#8c827a',
                  border: isCurrent
                    ? '4px solid rgba(244, 141, 22, 0.25)'
                    : isCompleted
                    ? '3px solid #251f19'
                    : '2px solid #dedcd3',
                  boxShadow: isCurrent ? '0 4px 14px rgba(244, 141, 22, 0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.25s ease',
                  marginBottom: '8px'
                }}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                </div>

                {/* Step Label */}
                <span style={{
                  fontSize: '13.5px',
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#251f19' : isCompleted ? '#251f19' : '#8c827a',
                  transition: 'color 0.2s'
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
