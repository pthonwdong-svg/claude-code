/**
 * Build-time macros replaced by Bun's `define` option during bundling.
 */
declare const MACRO: {
  /** Semver version string, e.g. "2.1.88" */
  VERSION: string
  /** ISO 8601 timestamp of the build */
  BUILD_TIME: string
  /** npm registry URL for the package */
  PACKAGE_URL: string
  /** URL for the native package distribution */
  NATIVE_PACKAGE_URL: string
  /** User-facing string explaining how to file issues */
  ISSUES_EXPLAINER: string
  /** Slack/Discord channel for feedback */
  FEEDBACK_CHANNEL: string
  /** JSON-encoded changelog for the current version */
  VERSION_CHANGELOG: string
}
