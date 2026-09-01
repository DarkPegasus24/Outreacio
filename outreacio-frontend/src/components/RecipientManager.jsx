import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, Download, Trash2, Sparkles, Search } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const isEmailLike = (val) => typeof val === 'string' && EMAIL_REGEX.test(val.trim());

// Auto-detects which column holds emails and which holds company names,
// no matter how many columns the sheet has or what they're named.
// Rows that don't contain a valid email (including the header row) are
// silently skipped — no "valid/invalid" status is ever shown to the user.
function extractRecipientsFromRows(rows) {
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

  if (emailCol === -1) return []; // no column looked like emails at all

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

  return dataRows.map((row, idx) => ({
    id: `rec_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    companyName: companyCol !== -1 ? String(row[companyCol] ?? '').trim() : '',
    email: String(row[emailCol]).trim()
  }));
}

export default function RecipientManager({ recipients, onUpdateRecipients, onBack, onContinue, isStepValid }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
        const parsed = extractRecipientsFromRows(rows);
        onUpdateRecipients(parsed);
      } catch (err) {
        alert(`Failed to read Excel file: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setIsParsing(false);
      alert('Failed to read the file. Please try again.');
    };

    reader.readAsArrayBuffer(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSample = () => {
    const samples = [
      { id: '1', companyName: 'Acme Corporation', email: 'alex@acmecorp.com' },
      { id: '2', companyName: 'Starlight Media', email: 'marketing@starlight.io' },
      { id: '3', companyName: 'Nexus AI Labs', email: 'partnerships@nexusai.tech' },
      { id: '4', companyName: 'Apex Cloud Solutions', email: 'contact@apexcloud.co' }
    ];
    onUpdateRecipients(samples);
  };

  const handleDownloadTemplate = () => {
    const wsData = [
      ['Company Name', 'Email'],
      ['Acme Corp', 'contact@acmecorp.com'],
      ['TechNova', 'team@technova.io'],
      ['Global Logistics', 'info@globallogistics.org']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');
    XLSX.writeFile(workbook, 'outreacio_recipient_template.xlsx');
  };

  const handleClearAll = () => {
    onUpdateRecipients([]);
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
            Tell us who should receive this email. Upload an Excel file — any column layout works.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleLoadSample}
            className="btn btn-secondary btn-sm"
            title="Load demo companies to test"
          >
            <Sparkles size={14} color="var(--accent)" />
            <span>Load Demo Data</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="btn btn-secondary btn-sm"
            title="Download formatted Excel template"
          >
            <Download size={14} />
            <span>Excel Template</span>
          </button>
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
        <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>
          {isParsing ? 'Reading your file…' : 'Click to upload or drag & drop an Excel file'}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          .xlsx or .xls only — any number of columns, in any order. We'll find the email and
          company name columns automatically. (Max 10,000 recipients per campaign)
        </p>
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
          <div style={{
            maxHeight: '260px',
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
                      <td style={{ padding: '8px 12px', fontWeight: '500' }}>{item.companyName || <em style={{ color: 'var(--text-muted)' }}>Unnamed</em>}</td>
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
      <div style={{
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
