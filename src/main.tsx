/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import App from './App.tsx'
import './index.css'

// IMMEDIATE React global assignment - must happen before any component imports
(window as any).React = React;
(globalThis as any).React = React;
if (typeof global !== 'undefined') {
  (global as any).React = React;
}

// Ensure React is available globally for all components
declare global {
  interface Window {
    React: typeof React;
  }
}

if (typeof window !== 'undefined') {
  window.React = React;
  (globalThis as typeof globalThis & { React: typeof React }).React = React;
}

// Add to global scope for modules
if (typeof global !== 'undefined') {
  (global as typeof global & { React: typeof React }).React = React;
}

// Mount the app with proper error logging
const mount = () => {
  try {
    console.log("Starting application mount...");
    
    // Double-check React is available
    if (!React || !React.createContext) {
      throw new Error("React is not properly loaded");
    }
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      const msg = "Root element not found!";
      console.error(msg);
      return;
    }

    console.log("Root element found, creating React root...");
    
    const root = createRoot(rootElement);
    console.log("React root created, rendering app...");
    
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        </QueryClientProvider>
      </StrictMode>
    );
    
    console.log("Application mounted successfully");
  } catch (error) {
    const msg = `Failed to mount application: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    
    // Display fallback UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h1>Something went wrong</h1>
          <p>${msg}</p>
          <button onclick="window.location.reload()">Reload</button>
        </div>
      `;
    }
  }
};

mount();
