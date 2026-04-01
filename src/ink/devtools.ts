// Stub for react-devtools-core integration.
// This module is dynamically imported in reconciler.ts when NODE_ENV === 'development'.
// The original imports react-devtools-core and connects to the devtools backend.

/* eslint-disable @typescript-eslint/no-empty-function */

export function connectToDevTools(): void {}

// Side-effect: ensure bundler does not eliminate this module's dynamic import
void 0
