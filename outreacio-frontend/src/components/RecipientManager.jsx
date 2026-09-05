import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, Trash2, Search, AlertCircle } from 'lucide-react';

const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const EMBEDDED_EMAIL_REGEX = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g;

// Extracts an email address from text (exact match or embedded within longer string)
function extractEmailFromText(val) {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str) return null;
  if (STRICT_EMAIL_REGEX.test(str)) return str;
  const matches = str.match(EMBEDDED_EMAIL_REGEX);
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  return null;
}

const isEmailLike = (val) => Boolean(extractEmailFromText(val));

// Auto-detects email and company name columns for a single sheet
function extractRecipientsFromRows(rows, sheetIndex = 0) {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const colCount = rows.reduce((max, r) => Math.max(max, r.length), 0);
  if (colCount === 0) return [];

  // 1. Find the email column: whichever column has the most email-like values.
  const emailScores = new Array(colCount).fill(0);
  for (const row of rows) {
    for (let c = 0; c < colCount; c++) {
      if (isEmailLike(row[c])) emailScores[c]++;
    }
  }

  let emailCol = -1;
  let bestScore = 0;
  emailScores.forEach((score, idx) => {
    if (score > bestScore) {
      bestScore = score;
      emailCol = idx;
    }
  });

  if (emailCol === -1) return []; // no column had emails in this sheet

  // Only keep rows that actually have a valid email in that column.
  const dataRows = rows.filter((row) => isEmailLike(row[emailCol]));

  // 2. Find the company-name column: the other column with the most
  // non-empty, non-email text values among the valid data rows.
  const fillScores = new Array(colCount).fill(0);
  dataRows.forEach((row) => {
    for (let c = 0; c < colCount; c++) {
      if (c === emailCol) continue;
      const v = row[c];
      if (v !== undefined && v !== null && String(v).trim() !== '' && !isEmailLike(v)) {
        fillScores[c]++;
      }
    }
  });

  let companyCol = -1;
  let bestFill = 0;
  fillScores.forEach((score, idx) => {
    if (score > bestFill) {
      bestFill = score;
      companyCol = idx;
    }
  });

  return dataRows.map((row, idx) => {
    const rawEmail = row[emailCol];
    const email = extractEmailFromText(rawEmail) || String(rawEmail).trim();
    return {
      id: `rec_${Date.now()}_${sheetIndex}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      companyName: companyCol !== -1 ? String(row[companyCol] ?? '').trim() : '',
      email
    };
  });
}

export default function RecipientManager({ recipients, onUpdateRecipients, onBack, onContinue, isStepValid }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setUploadError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let allExtracted = [];

        // Scan ALL sheets in the workbook
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) return;
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
          const sheetRecipients = extractRecipientsFromRows(rows, sheetIndex);
          if (sheetRecipients.length > 0) {
            allExtracted = allExtracted.concat(sheetRecipients);
          }
        });

        // Dedupe by email address (case-insensitive) across all sheets
        const seenEmails = new Set();
        const dedupedRecipients = [];
        for (const item of allExtracted) {
          const lowerEmail = item.email.toLowerCase();
          if (!seenEmails.has(lowerEmail)) {
            seenEmails.add(lowerEmail);
            dedupedRecipients.push(item);
          }
        }

        if (dedupedRecipients.length === 0) {
          setUploadError('No email addresses were found in this file. Make sure at least one column or cell contains valid email addresses.');
          onUpdateRecipients([]);
        } else {
          setUploadError(null);
          onUpdateRecipients(dedupedRecipients);
        }
      } catch (err) {
        setUploadError(`Failed to read Excel file: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      setUploadError('Failed to read the file. Please try again.');
    };

    reader.readAsArrayBuffer(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    onUpdateRecipients([]);
    setUploadError(null);
  };

  const handleDeleteRow = (id) => {
    onUpdateRecipients(recipients.filter((r) => r.id !== id));
  };

  const totalCount = recipients.length;

  const filteredRecipients = recipients.filter((r) => {
    return (
      (r.companyName || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

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
            Add Recipients
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Tell us who should receive this email. Upload an Excel file | any column layout works.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div style={{
        border: '2px dashed var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 20px',
        textAlign: 'center',
        background: 'var(--bg-white)',
        marginBottom: '18px',
        cursor: isParsing ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isParsing ? 0.7 : 1
      }}
      onClick={() => !isParsing && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: 'none' }}
        />
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'var(--accent-light)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px'
        }}>
          <UploadCloud size={24} color="var(--accent)" />
        </div>
        <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>
          {isParsing ? 'Scanning sheets and reading your file…' : 'Click to upload or drag & drop an Excel file'}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.5 }}>
          Any Excel file works | we'll scan every sheet and column, and pull out valid email addresses automatically, even if they're mixed in with other text.
        </p>

        {/* Inline No Emails Found Message */}
        {uploadError && (
          <div style={{
            marginTop: '14px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left',
            animation: 'fadeIn 0.25s ease'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {totalCount > 0 && (
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>
                Total Recipients: <strong>{totalCount}</strong>
              </span>
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Ready to send
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="btn btn-secondary btn-sm"
            >
              Clear List
            </button>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search company or email..."
                className="form-input"
                style={{ paddingLeft: '34px', fontSize: '13.5px' }}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive-container" style={{
            maxHeight: '320px',
            overflowY: 'auto',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '9px 12px', width: '45px', color: 'var(--text-secondary)' }}>#</th>
                  <th style={{ padding: '9px 12px', color: 'var(--text-secondary)' }}>Company Name</th>
                  <th style={{ padding: '9px 12px', color: 'var(--text-secondary)' }}>Email Address</th>
                  <th style={{ padding: '9px 12px', width: '50px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No recipients matching this search.
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((item, i) => (
                    <tr
                      key={item.id || i}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-white)'
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', fontWeight: '500', color: 'var(--text-primary)' }}>{item.companyName || <em style={{ color: 'var(--text-muted)' }}>Unnamed</em>}</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
                        {item.email}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '3px'
                          }}
                          title="Delete contact"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Card Footer */}
      <div className="card-footer-responsive" style={{
        marginTop: '24px',
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
          &larr; Back to Gmail
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {!isStepValid && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Upload an Excel file with at least 1 recipient.
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
            <span>Continue to Write Email</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
