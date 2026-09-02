import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link2, 
  Heading1, Heading2, Quote, Eye, Edit3, Code2, Tag, Smartphone, Monitor, ArrowRight,
  Paperclip, FileText, X, AlertCircle
} from 'lucide-react';

export default function EmailComposer({ 
  subject, 
  onSubjectChange, 
  bodyHtml, 
  onBodyHtmlChange, 
  attachments = [],
  onAttachmentsChange,
  recipients,
  onBack,
  onContinue,
  isStepValid
}) {
  const [activeView, setActiveView] = useState('split');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleInsertPlaceholder = (placeholder, target = 'body') => {
    if (target === 'subject') {
      onSubjectChange((subject || '') + placeholder);
    } else {
      if (activeView === 'html') {
        onBodyHtmlChange(bodyHtml + placeholder);
      } else {
        formatDoc('insertText', placeholder);
      }
    }
  };

  const getPreviewData = () => {
    const sample = recipients[previewIndex] || {
      companyName: 'Acme Corporation',
      email: 'alex@acmecorp.com'
    };

    const company = sample.companyName || 'Acme Corporation';
    const email = sample.email || 'alex@acmecorp.com';

    let previewSub = subject || 'No Subject';
    let previewBody = bodyHtml || '<p>No content written yet.</p>';

    previewSub = previewSub.replace(/\{\{\s*company\s*name\s*\}\}/gi, company);
    previewSub = previewSub.replace(/\{\{\s*company\s*\}\}/gi, company);
    previewSub = previewSub.replace(/\{\{\s*name\s*\}\}/gi, company);
    previewSub = previewSub.replace(/\{\{\s*email\s*\}\}/gi, email);

    previewBody = previewBody.replace(/\{\{\s*company\s*name\s*\}\}/gi, company);
    previewBody = previewBody.replace(/\{\{\s*company\s*\}\}/gi, company);
    previewBody = previewBody.replace(/\{\{\s*name\s*\}\}/gi, company);
    previewBody = previewBody.replace(/\{\{\s*email\s*\}\}/gi, email);

    return {
      recipient: sample,
      subject: previewSub,
      html: previewBody
    };
  };

  const preview = getPreviewData();

  return (
    <div className="parley-card" style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '28px 32px',
      boxShadow: '0 12px 36px rgba(37, 31, 25, 0.05)',
      maxWidth: '860px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Write Email
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Write what you want to say. Use {`{{Company Name}}`} to personalize each message.
          </p>
        </div>

        {/* View Switchers */}
        <div className="composer-view-tabs" style={{ display: 'flex', gap: '4px', background: '#f8f7f3', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveView('split')}
            className="btn btn-sm"
            style={{
              background: activeView === 'split' ? '#ffffff' : 'transparent',
              color: activeView === 'split' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'split' ? '700' : '500',
              boxShadow: activeView === 'split' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              border: activeView === 'split' ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: '7px'
            }}
          >
            <Eye size={13} /> Split Preview
          </button>

          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="btn btn-sm"
            style={{
              background: activeView === 'editor' ? '#ffffff' : 'transparent',
              color: activeView === 'editor' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'editor' ? '700' : '500',
              boxShadow: activeView === 'editor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              border: activeView === 'editor' ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: '7px'
            }}
          >
            <Edit3 size={13} /> Visual Editor
          </button>

          <button
            type="button"
            onClick={() => setActiveView('html')}
            className="btn btn-sm"
            style={{
              background: activeView === 'html' ? '#ffffff' : 'transparent',
              color: activeView === 'html' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: activeView === 'html' ? '700' : '500',
              boxShadow: activeView === 'html' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              border: activeView === 'html' ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: '7px'
            }}
          >
            <Code2 size={13} /> Raw HTML
          </button>
        </div>
      </div>

      {/* Subject Line & Dynamic Tag Injectors */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label className="form-label" style={{ marginBottom: 0, fontWeight: '600' }}>Email Subject</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleInsertPlaceholder('{{Company Name}}', 'subject')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              <Tag size={11} /> +{'{{Company Name}}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertPlaceholder('{{Email}}', 'subject')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              <Tag size={11} /> +{'{{Email}}'}
            </button>
          </div>
        </div>

        <input
          type="text"
          className="input"
          placeholder="e.g. Question for {{Company Name}}"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          style={{ height: '42px', fontWeight: '500' }}
        />
      </div>

      {/* Editor & Preview Split Area */}
      <div className="composer-split-view" style={{
        display: 'grid',
        gridTemplateColumns: activeView === 'split' ? '1fr 1fr' : '1fr',
        gap: '20px',
        alignItems: 'start',
        marginBottom: '20px'
      }}>
        {/* Editor Side */}
        {(activeView === 'split' || activeView === 'editor' || activeView === 'html') && (
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-surface)' }}>
            {/* Formatting Toolbar */}
            <div className="composer-toolbar" style={{
              background: '#f8f7f3',
              borderBottom: '1px solid var(--border)',
              padding: '8px 10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              alignItems: 'center'
            }}>
              {activeView !== 'html' ? (
                <>
                  <button type="button" onClick={() => formatDoc('bold')} className="btn btn-sm btn-icon" title="Bold"><Bold size={14} /></button>
                  <button type="button" onClick={() => formatDoc('italic')} className="btn btn-sm btn-icon" title="Italic"><Italic size={14} /></button>
                  <button type="button" onClick={() => formatDoc('underline')} className="btn btn-sm btn-icon" title="Underline"><Underline size={14} /></button>
                  <span style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />
                  <button type="button" onClick={() => formatDoc('insertUnorderedList')} className="btn btn-sm btn-icon" title="Bullet List"><List size={14} /></button>
                  <button type="button" onClick={() => formatDoc('insertOrderedList')} className="btn btn-sm btn-icon" title="Numbered List"><ListOrdered size={14} /></button>
                  <button type="button" onClick={handleInsertLink} className="btn btn-sm btn-icon" title="Insert Link"><Link2 size={14} /></button>
                  <span style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 4px' }} />
                  <button type="button" onClick={() => handleInsertPlaceholder('{{Company Name}}', 'body')} className="btn btn-sm" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    +{'{{Company Name}}'}
                  </button>
                  <button type="button" onClick={() => handleInsertPlaceholder('{{Email}}', 'body')} className="btn btn-sm" style={{ fontSize: '11px', padding: '3px 8px' }}>
                    +{'{{Email}}'}
                  </button>
                </>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Raw HTML Editing Mode</span>
              )}
            </div>

            {/* Editable Content Area */}
            {activeView === 'html' ? (
              <textarea
                value={bodyHtml}
                onChange={(e) => onBodyHtmlChange(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '260px',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  border: 'none',
                  outline: 'none',
                  resize: 'vertical',
                  background: 'var(--bg-white)',
                  lineHeight: 1.5
                }}
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => onBodyHtmlChange(e.currentTarget.innerHTML)}
                style={{
                  minHeight: '260px',
                  padding: '16px',
                  outline: 'none',
                  background: 'var(--bg-white)',
                  fontSize: '14px',
                  lineHeight: 1.6
                }}
              />
            )}
          </div>
        )}

        {/* Live Preview Side */}
        {(activeView === 'split' || activeView === 'preview') && (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            padding: '14px',
            minHeight: '290px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Preview Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontWeight: '600' }}>Live Recipient Preview:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={previewIndex}
                  onChange={(e) => setPreviewIndex(Number(e.target.value))}
                  style={{
                    fontSize: '12px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    outline: 'none'
                  }}
                >
                  {recipients.length > 0 ? (
                    recipients.slice(0, 15).map((r, i) => (
                      <option key={r.id || i} value={i}>
                        {i + 1}. {r.companyName || r.email || `Lead #${i+1}`}
                      </option>
                    ))
                  ) : (
                    <option value={0}>Sample: Acme Corp</option>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => setPreviewDevice(previewDevice === 'desktop' ? 'mobile' : 'desktop')}
                  className="btn btn-sm btn-icon"
                  title="Toggle Mobile/Desktop"
                >
                  {previewDevice === 'desktop' ? <Smartphone size={13} /> : <Monitor size={13} />}
                </button>
              </div>
            </div>

            {/* Email Shell */}
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#fdfdfc',
              flexGrow: 1,
              maxWidth: previewDevice === 'mobile' ? '320px' : '100%',
              margin: '0 auto',
              width: '100%'
            }}>
              <div style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <strong>To:</strong> {preview.recipient.companyName ? `${preview.recipient.companyName} <${preview.recipient.email}>` : preview.recipient.email}
                </div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>
                  {preview.subject}
                </div>
              </div>

              <div 
                style={{ padding: '16px', fontSize: '13.5px', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          </div>
        )}
      </div>

      {/* File Attachments Section */}
      <div style={{
        marginTop: '20px',
        padding: '16px 20px',
        background: '#f8f7f3',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: attachments.length > 0 ? '12px' : '0',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Paperclip size={16} color="var(--accent)" />
            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
              Attachments
            </strong>
            {attachments.length > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ({attachments.length} file{attachments.length === 1 ? '' : 's'} &bull; {(attachments.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB / 20 MB)
              </span>
            )}
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const currentTotal = attachments.reduce((acc, f) => acc + (f.size || 0), 0);
                const newTotal = currentTotal + files.reduce((acc, f) => acc + f.size, 0);
                if (newTotal > 20 * 1024 * 1024) {
                  alert(`Adding these files would exceed the 20MB limit (${(newTotal / (1024 * 1024)).toFixed(1)} MB). Please remove some files.`);
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
              disabled={attachments.reduce((acc, f) => acc + (f.size || 0), 0) > 20 * 1024 * 1024}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '5px 12px' }}
            >
              <Paperclip size={13} />
              <span>Attach Files</span>
            </button>
          </div>
        </div>

        {/* Exceeding Size Warning */}
        {attachments.reduce((acc, f) => acc + (f.size || 0), 0) > 20 * 1024 * 1024 && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error)',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>Combined attachment size exceeds the 20MB limit. Please remove some files.</span>
          </div>
        )}

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
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
                    maxWidth: '280px'
                  }}
                >
                  <FileText size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: '500'
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
                      marginLeft: '2px'
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

      {/* Unified Card Footer */}
      <div className="card-footer-responsive" style={{
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '9px 18px', fontSize: '13.5px' }}
        >
          &larr; Back to Recipients
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!isStepValid && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Write a subject and email body first.
            </span>
          )}
          <button
            type="button"
            disabled={!isStepValid}
            onClick={onContinue}
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '14.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Continue to Review &amp; Send</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
