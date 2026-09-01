import React, { useState } from 'react';

export default function FaqSection({ onLaunchApp, onOpenContactForm }) {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How do I upload my email list?',
      a: 'Just copy-paste emails or upload a CSV file. We will automatically check each email for syntax errors and show you exactly what is ready to send.'
    },
    {
      q: 'Is my Gmail password safe?',
      a: 'Yes, 100%! Your Gmail App Password is never saved to any database or hard drive. It stays in temporary memory only while sending, and is deleted when you finish.'
    },
    {
      q: 'What is the maximum number of emails I can send?',
      a: 'Gmail allows around 100–200 emails per day for free accounts (and up to 2,000 for Google Workspace). Perfect for personal outreach and founders.'
    },
    {
      q: 'How do I avoid getting flagged as spam?',
      a: 'Use the built-in speed slider. Slower sending is safer. We space emails 2–3 seconds apart by default to keep your Gmail sender reputation clean.'
    },
    {
      q: 'Can I personalize every email?',
      a: 'Yes! Add {{Company Name}} and {{Email}} to your subject or message. Outreacio automatically customizes every single email for each recipient.'
    }
  ];

  return (
    <section id="faq" style={{ padding: '40px 0 20px' }}>
      <div className="parley-faq-wrapper">
        {/* Left Column: Heading, Still Curious CTA, and Pixel Art */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            FAQ
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5vw, 3.6rem)',
            lineHeight: 1.1,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: '28px'
          }}>
            Questions<br />
            answered.
          </h2>

          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Still curious?
          </div>

          <button
            onClick={onOpenContactForm || onLaunchApp}
            className="parley-chat-btn"
            style={{ marginBottom: '40px' }}
          >
            <div className="parley-chat-icon">
              &gt;
            </div>
            <span>Chat with us</span>
          </button>

          {/* Geometric Pixel Art below CTA */}
          <div style={{ position: 'relative', width: '280px', height: '90px', marginTop: '20px' }}>
            <div style={{ position: 'absolute', bottom: '15px', left: '10px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '40px', left: '10px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '40px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '15px', left: '50px', width: '14px', height: '14px', background: '#f3c490', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '70px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '15px', left: '85px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '105px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '65px', left: '90px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '70px', left: '120px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '70px', left: '140px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '45px', left: '160px', width: '14px', height: '14px', background: '#f48d16', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '70px', left: '215px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '195px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '250px', width: '14px', height: '14px', background: '#f8deb8', borderRadius: '2px' }} />
          </div>
        </div>

        {/* Right Column: Parley Rounded Accordion Cards */}
        <div>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="parley-faq-item">
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  className="parley-faq-btn"
                >
                  <span>{faq.q}</span>
                  <span
                    className="parley-faq-icon"
                    style={{
                      transform: isOpen ? 'rotate(45deg)' : 'none'
                    }}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="parley-faq-body">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
