import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link2, 
  Eye, Edit3, Tag, Smartphone, Monitor, ArrowRight, ArrowLeft,
  Paperclip, FileText, X, AlertCircle, Sparkles, ChevronLeft, ChevronRight,
  Mail, CheckCircle2, Info
} from 'lucide-react';

export default function EmailComposer({ 
  subject, 
  onSubjectChange, 
  bodyHtml, 
  onBodyHtmlChange, 
  attachments = [],
  onAttachmentsChange,
  recipients = [],
  onBack,
  onContinue,
  isStepValid
}) {
  const [activeView, setActiveView] = useState('split'); // 'split' | 'editor' | 'preview'
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [activeTarget, setActiveTarget] = useState('body'); // 'subject' | 'body'
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync editor content with prop
  useEffect(() => {
    if (editorRef.current && (activeView === 'editor' || activeView === 'split')) {
      if (editorRef.current.innerHTML !== bodyHtml) {
        editorRef.current.innerHTML = bodyHtml || '<p>Hi <strong>{{Company Name}}</strong> Team,</p><p>We wanted to reach out regarding your current workflow and share how our automated tools can save you hours each week.</p><p>Would you have 10 minutes for a quick intro this week?</p><p>Best regards,<br><strong>Alex from Outreacio</strong></p>';
        if (!bodyHtml) {
          onBodyHtmlChange(editorRef.current.innerHTML);
        }
      }
    }
  }, [activeView]);

  const formatDoc = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      onBodyHtmlChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://yourcompany.com):', 'https://');
    if (url) {
      formatDoc('createLink', url);
    }
  };

  const handleInsertPlaceholder = (placeholder, target = activeTarget) => {
    if (target === 'subject') {
      onSubjectChange((subject || '') + placeholder);
    } else {
      if (editorRef.current) {
        editorRef.current.focus();
        formatDoc('insertText', placeholder);
      } else {
        onBodyHtmlChange((bodyHtml || '') + placeholder);
      }
    }
  };

  // Compute live preview for the selected recipient
  const getPreviewData = () => {
    const safeRecipients = recipients && recipients.length > 0 ? recipients : [];
    const safeIndex = Math.min(Math.max(0, previewIndex), Math.max(0, safeRecipients.length - 1));
    const sample = safeRecipients[safeIndex] || {
      companyName: 'Acme Corporation',
      email: 'alex@acmecorp.com'
    };

    const company = sample.companyName || sample.name || 'Acme Corporation';
    const email = sample.email || 'alex@acmecorp.com';

    let previewSub = subject || 'No Subject';
    let previewBody = bodyHtml || '<p>No content written yet.</p>';

    // Replace all variable patterns
    const replaceVars = (text) => {
      if (!text) return '';
      return text
        .replace(/\{\{\s*company\s*name\s*\}\}/gi, company)
        .replace(/\{\{\s*company\s*\}\}/gi, company)
        .replace(/\{\{\s*name\s*\}\}/gi, company)
        .replace(/\{\{\s*email\s*\}\}/gi, email);
    };

    return {
      recipient: sample,
      company,
      email,
      subject: replaceVars(previewSub),
      html: replaceVars(previewBody),
      totalCount: safeRecipients.length
    };
  };

  const preview = getPreviewData();
  const totalAttachmentBytes = attachments.reduce((acc, f) => acc + (f.size || 0), 0);
  const maxAttachmentBytes = 20 * 1024 * 1024; // 20 MB

  return (
    <div className="parley-card" style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      padding: '30px 32px',
      boxShadow: 'var(--shadow-card)',
      maxWidth: '920px',
      margin: '0 auto'
    }}>
      {/* ─── 1. Header & View Toggle ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '14px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Write Email
            </h2>
            <span style={{
              background: 'var(--accent-light, rgba(244, 141, 22, 0.12))',
              color: 'var(--accent, #f48d16)',
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Step 3 of 4
            </span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Craft your message template. Personalization tags are automatically replaced for each recipient.
          </p>
        </div>

        {/* View Switcher Tabs (Split View / Editor / Preview) */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: '3px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          gap: '3px'
        }}>
          <button
            type="button"
            onClick={() => setActiveView('split')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === 'split' ? 'var(--bg-white)' : 'transparent',
              color: activeView === 'split' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'split' ? '700' : '500',
              fontSize: '13px',
              boxShadow: activeView === 'split' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={14} color={activeView === 'split' ? 'var(--accent)' : 'currentColor'} />
            <span>Split Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('editor')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === 'editor' ? 'var(--bg-white)' : 'transparent',
              color: activeView === 'editor' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'editor' ? '700' : '500',
              fontSize: '13px',
              boxShadow: activeView === 'editor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Edit3 size={14} color={activeView === 'editor' ? 'var(--accent)' : 'currentColor'} />
            <span>Editor Only</span>
          </button>
        </div>
      </div>

      {/* ─── 2. Personalization Tags Helper Bar ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '10px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent, #f48d16)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
            Personalization Tags:
          </span>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Click a tag to insert into template:
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleInsertPlaceholder('{{Company Name}}')}
            className="btn btn-sm"
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--bg-white)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: 'var(--shadow-subtle)'
            }}
            title="Inserts recipient's company or business name"
          >
            <Tag size={12} color="var(--accent)" />
            <span>+ {'{{Company Name}}'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertPlaceholder('{{Email}}')}
            className="btn btn-sm"
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--bg-white)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: 'var(--shadow-subtle)'
            }}
            title="Inserts recipient's email address"
          >
            <Tag size={12} color="var(--accent)" />
            <span>+ {'{{Email}}'}</span>
          </button>
        </div>
      </div>

      {/* ─── 3. Email Subject Input ─── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Email Subject
          </label>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Supports dynamic tags
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input"
            placeholder="e.g. Quick question for {{Company Name}}"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            onFocus={() => setActiveTarget('subject')}
            style={{
              width: '100%',
              height: '44px',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '14.5px',
              fontWeight: '500',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* ─── 4. Main Body: Split View (Editor & Live Preview) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: activeView === 'split' ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
        gap: '20px',
        alignItems: 'stretch',
        marginBottom: '22px'
      }}>
        {/* ── Left: Rich Text Editor ── */}
        <div 
          onClick={() => setActiveTarget('body')}
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Formatting Toolbar */}
          <div style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '8px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={() => formatDoc('bold')}
              style={toolbarBtnStyle}
              title="Bold (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => formatDoc('italic')}
              style={toolbarBtnStyle}
              title="Italic (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => formatDoc('underline')}
              style={toolbarBtnStyle}
              title="Underline (Ctrl+U)"
            >
              <Underline size={14} />
            </button>

            <span style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />

            <button
              type="button"
              onClick={() => formatDoc('insertUnorderedList')}
              style={toolbarBtnStyle}
              title="Bullet List"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => formatDoc('insertOrderedList')}
              style={toolbarBtnStyle}
              title="Numbered List"
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              style={toolbarBtnStyle}
              title="Insert Link"
            >
              <Link2 size={14} />
            </button>
          </div>

          {/* Editable Content */}
          <div
            ref={editorRef}
            contentEditable
            onFocus={() => setActiveTarget('body')}
            onInput={(e) => onBodyHtmlChange(e.currentTarget.innerHTML)}
            style={{
              minHeight: '280px',
              padding: '18px 20px',
              outline: 'none',
              background: 'var(--bg-white)',
              fontSize: '14px',
              lineHeight: 1.65,
              color: 'var(--text-primary)',
              flexGrow: 1
            }}
          />
        </div>

        {/* ── Right: Live Recipient Email Preview ── */}
        {activeView === 'split' && (
          <div style={{
            border: '1.5px solid var(--border)',
            borderRadius: '16px',
            background: 'var(--bg-surface)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Preview Header & Recipient Selector Bar */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 6px #22c55e'
                }} />
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Live Preview:
                </span>
              </div>

              {/* Recipient Dropdown & Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                  disabled={previewIndex <= 0}
                  style={{
                    padding: '4px 6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    color: previewIndex <= 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: previewIndex <= 0 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Previous recipient"
                >
                  <ChevronLeft size={14} />
                </button>

                <select
                  value={previewIndex}
                  onChange={(e) => setPreviewIndex(Number(e.target.value))}
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    maxWidth: '160px',
                    cursor: 'pointer'
                  }}
                >
                  {recipients && recipients.length > 0 ? (
                    recipients.slice(0, 50).map((r, i) => (
                      <option key={r.id || i} value={i}>
                        {i + 1}. {r.companyName || r.name || r.email || `Lead #${i + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value={0}>Sample: Acme Corp</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => setPreviewIndex(Math.min((recipients.length || 1) - 1, previewIndex + 1))}
                  disabled={previewIndex >= (recipients.length || 1) - 1}
                  style={{
                    padding: '4px 6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    color: previewIndex >= (recipients.length || 1) - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: previewIndex >= (recipients.length || 1) - 1 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Next recipient"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Email Preview Client Card */}
            <div style={{
              background: 'var(--bg-white)',
              padding: '16px 18px',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              fontSize: '13.5px'
            }}>
              {/* To Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--border)',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent-light, rgba(244, 141, 22, 0.15))',
                  color: 'var(--accent, #f48d16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '13px'
                }}>
                  {(preview.company || 'A').charAt(0).toUpperCase()}
                </div>
                <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {preview.company}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    To: &lt;{preview.email}&gt;
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                  Just now
                </div>
              </div>

              {/* Subject Preview */}
              <div style={{
                fontSize: '14px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                marginBottom: '12px',
                lineHeight: 1.3
              }}>
                {preview.subject}
              </div>

              {/* Body Preview */}
              <div 
                style={{
                  fontSize: '13.5px',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                  flexGrow: 1,
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── 5. Attachments Bar ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '14px 18px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={16} color="var(--accent)" />
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Attachments
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {attachments.length > 0 
                ? `(${attachments.length} file${attachments.length === 1 ? '' : 's'} • ${(totalAttachmentBytes / (1024 * 1024)).toFixed(2)} MB / 20 MB)`
                : '(Optional • PDF, DOCX, XLSX, Images up to 20MB)'}
            </span>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const currentTotal = totalAttachmentBytes;
                const newTotal = currentTotal + files.reduce((acc, f) => acc + f.size, 0);
                if (newTotal > maxAttachmentBytes) {
                  alert(`Adding these files would exceed the 20MB limit (${(newTotal / (1024 * 1024)).toFixed(1)} MB).`);
                  return;
                }
                onAttachmentsChange?.([...attachments, ...files]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.csv,.txt"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              <Paperclip size={13} />
              <span>Attach Files</span>
            </button>
          </div>
        </div>

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {attachments.map((file, index) => {
              const formattedSize = file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

              return (
                <div
                  key={`${file.name}_${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    maxWidth: '300px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <FileText size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: '600'
                    }}
                    title={file.name}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    ({formattedSize})
                  </span>
                  <button
                    type="button"
                    onClick={() => onAttachmentsChange?.(attachments.filter((_, idx) => idx !== index))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                      marginLeft: '4px'
                    }}
                    title="Remove attachment"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 6. Footer Navigation ─── */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            padding: '10px 20px',
            fontSize: '13.5px',
            fontWeight: '600',
            borderRadius: '10px'
          }}
        >
          &larr; Back to Recipients
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!isStepValid && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Enter a subject and email body to continue.
            </span>
          )}
          <button
            type="button"
            disabled={!isStepValid}
            onClick={onContinue}
            className="btn btn-primary"
            style={{
              padding: '11px 26px',
              fontSize: '14.5px',
              fontWeight: '700',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(244, 141, 22, 0.35)'
            }}
          >
            <span>Continue to Review &amp; Send</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const toolbarBtnStyle = {
  background: 'var(--bg-white)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '6px 8px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  transition: 'all 0.15s ease'
};
