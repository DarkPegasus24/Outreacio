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

/** Upgrade plan | also stores payment info as plain text */
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
    console.warn('Failed to fetch plans from backend API, using static plans fallback:', err);
  }
  
  // Fallback to static plans (works in both dev and production)
  return {
    free: {
      id: 'free',
      name: 'Free',
      priceMonthly: 0,
      priceInr: 0,
      inboxLimit: 1,
      sendCapDaily: 25,
      aiCreditsMonthly: 0,
      verificationCreditsMonthly: 0,
      features: {
        crmIntegration: false,
        advancedAnalytics: false,
        teamSeats: 1,
        priorityQueue: false,
      },
    },
    pro: {
      id: 'pro',
      name: 'Paid Plan',
      priceMonthly: 4.99,
      priceInr: 425,
      inboxLimit: null,
      sendCapDaily: 150,
      aiCreditsMonthly: 3000,
      verificationCreditsMonthly: 5000,
      features: {
        crmIntegration: true,
        advancedAnalytics: true,
        teamSeats: 1,
        priorityQueue: true,
      },
    },
  };
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

/** Submit contact message from Contact Page */
export async function submitContactMessage({ name, email, message }) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message })
  });
  const data = await res.json().catch(() => ({ error: 'Submission failed' }));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit contact message.');
  }
  return data;
}

/** Fetch all contact messages for admin view */
export async function fetchAdminContacts(adminKey = '') {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminKey ? { 'x-admin-key': adminKey } : {})
  };
  const res = await fetch('/api/admin/contacts', { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unauthorized or failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Admin update contact message status (read, replied, unread) */
export async function updateAdminContactStatus(contactId, status, adminNotes = '', adminKey = '') {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminKey ? { 'x-admin-key': adminKey } : {})
  };
  const res = await fetch(`/api/admin/contacts/${contactId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status, adminNotes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Update failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/** Admin delete contact message */
export async function deleteAdminContactMessage(contactId, adminKey = '') {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(adminKey ? { 'x-admin-key': adminKey } : {})
  };
  const res = await fetch(`/api/admin/contacts/${contactId}`, {
    method: 'DELETE',
    headers
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Deletion failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
