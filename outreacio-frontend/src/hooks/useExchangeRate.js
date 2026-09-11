import { useState, useEffect } from 'react';
import { getApiUrl } from '../api/config';

export function useExchangeRate() {
  const [inrRate, setInrRate] = useState(() => {
    try {
      const cached = localStorage.getItem('usdToInrRate');
      return cached ? parseFloat(cached) : 87;
    } catch {
      return 87;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRate = async () => {
      try {
        const now = Date.now();
        const cached = localStorage.getItem('usdToInrRate');
        const cachedTime = localStorage.getItem('usdToInrTime');

        // Use cache if fresh (< 24 hours)
        if (cached && cachedTime && (now - parseInt(cachedTime, 10)) < 86400000) {
          if (isMounted) {
            setInrRate(parseFloat(cached));
            setLoading(false);
          }
          return;
        }

        let resolvedRate = null;

        // 1. Try our backend first (already has server-side rate sync, no CORS/firewall issues)
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(getApiUrl('/api/plans'), { signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (data?.usdToInrRate && data.usdToInrRate > 50 && data.usdToInrRate < 200 && data.usdToInrRate !== 85) {
              resolvedRate = data.usdToInrRate;
            } else if (data?.plans?.pro?.priceINR && data.plans.pro.priceINR !== 425) {
              resolvedRate = data.plans.pro.priceINR / 4.99;
            }
          }
        } catch (_) {
          // Backend not reachable or timeout, proceed to external fallback
        }

        // 2. If backend didn't supply rate, try public exchange rate APIs with a 3s timeout
        if (!resolvedRate) {
          const endpoints = [
            'https://open.er-api.com/v6/latest/USD',
            'https://api.exchangerate-api.com/v4/latest/USD'
          ];

          for (const url of endpoints) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 2500);
              const response = await fetch(url, { signal: controller.signal });
              clearTimeout(timeoutId);
              if (response.ok) {
                const data = await response.json();
                if (data?.rates?.INR && typeof data.rates.INR === 'number') {
                  resolvedRate = data.rates.INR;
                  break;
                }
              }
            } catch (_) {
              // Timeout or network error, silently try next endpoint
            }
          }
        }

        if (resolvedRate && isMounted) {
          setInrRate(resolvedRate);
          try {
            localStorage.setItem('usdToInrRate', resolvedRate.toString());
            localStorage.setItem('usdToInrTime', now.toString());
          } catch (_) {}
        }
      } catch (err) {
        // Fallback gracefully without breaking UI
        console.warn('Exchange rate sync notice: using default/cached rate');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRate();

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate the INR price for $4.99
  const paidPlanInrPrice = Math.round(4.99 * inrRate);

  return { inrRate, paidPlanInrPrice, loading };
}

export default useExchangeRate;
