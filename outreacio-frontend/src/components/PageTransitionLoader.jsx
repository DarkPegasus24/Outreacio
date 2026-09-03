import React from 'react';
import SkeletonLoader from './SkeletonLoader';

export default function PageTransitionLoader({ targetView }) {
  if (targetView === 'pricing') {
    return <SkeletonLoader type="plans" />;
  }
  if (targetView === 'billing') {
    return <SkeletonLoader type="billing" />;
  }
  return <SkeletonLoader type="dashboard" />;
}
