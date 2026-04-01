import { readFileSync } from 'fs'
import { resolve } from 'path'

export type MacroDefineOptions = {
  /** ISO build time; defaults to `new Date().toISOString()` */
  buildTime?: string
}

/**
 * Same key/value shape as Bun.build `define` / `bun --define` (values are JSON-stringified JS literals).
 */
export function getMacroDefineRecord(
  repoRoot: string,
  opts?: MacroDefineOptions,
): Record<string, string> {
  const pkg = JSON.parse(
    readFileSync(resolve(repoRoot, 'package.json'), 'utf-8'),
  ) as { version: string }
  const now = opts?.buildTime ?? new Date().toISOString()
  return {
    'MACRO.VERSION': JSON.stringify(pkg.version),
    'MACRO.BUILD_TIME': JSON.stringify(now),
    'MACRO.PACKAGE_URL': JSON.stringify(
      'https://www.npmjs.com/package/@anthropic-ai/claude-code',
    ),
    'MACRO.NATIVE_PACKAGE_URL': JSON.stringify(
      'https://www.npmjs.com/package/@anthropic-ai/claude-code',
    ),
    'MACRO.ISSUES_EXPLAINER': JSON.stringify(
      'report the issue at https://github.com/anthropics/claude-code/issues',
    ),
    'MACRO.FEEDBACK_CHANNEL': JSON.stringify(
      'https://github.com/anthropics/claude-code/issues',
    ),
    'MACRO.VERSION_CHANGELOG': JSON.stringify('{}'),
  }
}

export function getMacroDefineBunArgs(
  repoRoot: string,
  opts?: MacroDefineOptions,
): string[] {
  const d = getMacroDefineRecord(repoRoot, opts)
  return Object.entries(d).flatMap(([k, v]) => ['--define', `${k}=${v}`])
}
