/* eslint-disable @typescript-eslint/no-explicit-any */
// React polyfill to prevent createContext errors
import * as React from 'react';

// Simple React assignment to global scope
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (globalThis as any).React = React;
}

if (typeof global !== 'undefined') {
  (global as any).React = React;
}

export default React;
