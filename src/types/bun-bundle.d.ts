/**
 * Type declarations for bun:bundle — Bun's build-time feature flags module.
 *
 * At build time, `feature('FLAG_NAME')` is replaced with a boolean literal,
 * enabling dead code elimination for conditional imports.
 */
declare module 'bun:bundle' {
  /**
   * Returns true if the named feature flag is enabled for this build.
   * The call is replaced at build time with a boolean literal.
   */
  export function feature(name: string): boolean
}
