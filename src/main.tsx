import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import App from './App.tsx'
import './index.css'

// Ensure React is available globally before any context creation
if (typeof window !== 'undefined') {
  (window as typeof window & { React: typeof React }).React = React;
}

declare global {
  interface Window {
    debugMount: (msg: string) => void;
    React?: typeof React;
  }
}

// Mount the app with proper error logging
const mount = () => {
  try {
    console.log("Starting application mount...");
    
    // Verify React is properly loaded
    if (!React || !React.createContext || !React.StrictMode) {
      throw new Error("React is not properly loaded or missing essential APIs");
    }
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      const msg = "Root element not found!";
      console.error(msg);
      window.debugMount?.(msg);
      return;
    }

    console.log("Root element found, creating React root...");
    
    const root = createRoot(rootElement);
    console.log("React root created, rendering app...");
    
    root.render(
      React.createElement(React.StrictMode, {}, 
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(App),
          React.createElement(ReactQueryDevtools, { initialIsOpen: false, position: "bottom" })
        )
      )
    );
    
    console.log("Application mounted successfully");
  } catch (error) {
    const msg = `Failed to mount application: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    window.debugMount?.(msg);
    
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
