// src/api/planService.js
// Centralized API helpers for plan & billing operations

async function getAuthToken() {
  // Import supabase lazily to avoid circular deps
  const { supabase } = await import('../supabaseClient.js');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function authFetch(url, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Fetch the current plan for the logged-in user */
export async function fetchCurrentPlan() {
  return authFetch('/api/account/plan');
}

/** Fetch usage counters for the logged-in user */
export async function fetchUsage() {
  return authFetch('/api/account/usage');
}

/** Upgrade plan — also stores payment info as plain text */
export async function upgradePlan(planId, paymentInfo = {}, csrfToken = '') {
  return authFetch('/api/upgrade-plan', {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken },
    body: JSON.stringify({ planId, paymentInfo })
  });
}

/** Fetch all available plan definitions */
export async function fetchPlans() {
  try {
    const data = await fetch('/api/plans').then(r => r.json());
    if (data && data.plans && Object.keys(data.plans).length > 0) {
      return data.plans;
    }
  } catch (err) {
    console.warn('Failed to fetch plans from backend API, using static plans config fallback:', err);
  }
  const { default: staticPlans } = await import('../config/plans.ts');
  return staticPlans;
}

/** Submit manual UPI payment proof (FormData with screenshot file & UTR) */
export async function submitUpiPaymentProof(formData, csrfToken = '') {
  const token = await getAuthToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {})
  };
  const res = await fetch('/api/payments/submit', {
    method: 'POST',
    headers,
    body: formData // multipart/form-data
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Fetch all payment submissions for admin review */
export async function fetchAdminPayments(adminKey = '') {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminKey ? { 'x-admin-key': adminKey } : {})
  };
  const res = await fetch('/api/admin/payments', { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized or failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Admin approve or reject payment submission */
export async function reviewPaymentSubmission(submissionId, decision, reason = '', adminKey = '') {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminKey ? { 'x-admin-key': adminKey } : {})
  };
  const res = await fetch(`/api/admin/payments/${submissionId}/review`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ decision, reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Review action failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

