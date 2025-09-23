import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {
  registerServiceWorker,
  setupOfflineDetection,
} from './utils/serviceWorker.ts';
import { initPerformanceMonitoring } from './utils/performanceMonitor.ts';

// Initialize performance monitoring in development
initPerformanceMonitoring();

// Register service worker for performance optimization
if (import.meta.env.PROD) {
  registerServiceWorker();
}

// Setup offline detection
setupOfflineDetection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
