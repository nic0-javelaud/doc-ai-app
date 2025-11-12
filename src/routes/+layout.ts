import { injectAnalytics } from '@vercel/analytics/sveltekit'
injectAnalytics({ mode: 'production' });

export const ssr = false;
