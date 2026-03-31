#!/usr/bin/env bun
/**
 * Build script for Claude Code CLI.
 *
 * Produces a single bundled ESM file at dist/cli.js using Bun's bundler,
 * with build-time macro replacement (MACRO.*) and feature flag dead-code
 * elimination (bun:bundle feature()).
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(readFileSync(resolve(import.meta.dir, '..', 'package.json'), 'utf-8'))
const version: string = pkg.version

const now = new Date().toISOString()

// ── Feature flags ──────────────────────────────────────────────────
// All known feature flags. Set to true to include, false to tree-shake.
// Default: most flags disabled for a minimal build.
const featureFlags: Record<string, boolean> = {
  ABLATION_BASELINE: false,
  AGENT_MEMORY_SNAPSHOT: false,
  AGENT_TRIGGERS_REMOTE: false,
  AGENT_TRIGGERS: true,
  ALLOW_TEST_VERSIONS: false,
  ANTI_DISTILLATION_CC: false,
  AUTO_THEME: true,
  AWAY_SUMMARY: false,
  BASH_CLASSIFIER: false,
  BG_SESSIONS: false,
  BREAK_CACHE_COMMAND: false,
  BRIDGE_MODE: true,
  BUDDY: false,
  BUILDING_CLAUDE_APPS: true,
  BUILTIN_EXPLORE_PLAN_AGENTS: true,
  BYOC_ENVIRONMENT_RUNNER: false,
  CACHED_MICROCOMPACT: false,
  CCR_AUTO_CONNECT: false,
  CCR_MIRROR: false,
  CCR_REMOTE_SETUP: false,
  CHICAGO_MCP: false,
  COMMIT_ATTRIBUTION: true,
  COMPACTION_REMINDERS: true,
  CONNECTOR_TEXT: false,
  CONTEXT_COLLAPSE: false,
  COORDINATOR_MODE: false,
  COWORKER_TYPE_TELEMETRY: false,
  DAEMON: false,
  DIRECT_CONNECT: false,
  DOWNLOAD_USER_SETTINGS: false,
  DUMP_SYSTEM_PROMPT: false,
  ENHANCED_TELEMETRY_BETA: false,
  EXPERIMENTAL_SKILL_SEARCH: false,
  EXTRACT_MEMORIES: true,
  FILE_PERSISTENCE: false,
  FORK_SUBAGENT: true,
  HARD_FAIL: false,
  HISTORY_PICKER: true,
  HISTORY_SNIP: false,
  HOOK_PROMPTS: true,
  IS_LIBC_GLIBC: false,
  IS_LIBC_MUSL: false,
  KAIROS_BRIEF: false,
  KAIROS_CHANNELS: false,
  KAIROS_DREAM: false,
  KAIROS_GITHUB_WEBHOOKS: false,
  KAIROS_PUSH_NOTIFICATION: false,
  KAIROS: false,
  LODESTONE: false,
  MCP_RICH_OUTPUT: true,
  MCP_SKILLS: true,
  MEMORY_SHAPE_TELEMETRY: false,
  MESSAGE_ACTIONS: false,
  MONITOR_TOOL: false,
  NATIVE_CLIENT_ATTESTATION: false,
  NATIVE_CLIPBOARD_IMAGE: false,
  NEW_INIT: false,
  OVERFLOW_TEST_TOOL: false,
  PERFETTO_TRACING: false,
  POWERSHELL_AUTO_MODE: false,
  PROACTIVE: false,
  PROMPT_CACHE_BREAK_DETECTION: false,
  QUICK_SEARCH: false,
  REACTIVE_COMPACT: false,
  REVIEW_ARTIFACT: false,
  RUN_SKILL_GENERATOR: false,
  SELF_HOSTED_RUNNER: false,
  SHOT_STATS: false,
  SKILL_IMPROVEMENT: false,
  SKIP_DETECTION_WHEN_AUTOUPDATES_DISABLED: false,
  SLOW_OPERATION_LOGGING: false,
  SSH_REMOTE: false,
  STREAMLINED_OUTPUT: false,
  TEAMMEM: false,
  TEMPLATES: false,
  TERMINAL_PANEL: false,
  TOKEN_BUDGET: false,
  TORCH: false,
  TRANSCRIPT_CLASSIFIER: false,
  TREE_SITTER_BASH_SHADOW: false,
  TREE_SITTER_BASH: false,
  UDS_INBOX: false,
  ULTRAPLAN: false,
  ULTRATHINK: true,
  UNATTENDED_RETRY: false,
  UPLOAD_USER_SETTINGS: false,
  VERIFICATION_AGENT: false,
  VOICE_MODE: false,
  WEB_BROWSER_TOOL: false,
  WORKFLOW_SCRIPTS: false,
}

// ── Build-time macro definitions ───────────────────────────────────
const define: Record<string, string> = {
  'MACRO.VERSION': JSON.stringify(version),
  'MACRO.BUILD_TIME': JSON.stringify(now),
  'MACRO.PACKAGE_URL': JSON.stringify(`https://www.npmjs.com/package/@anthropic-ai/claude-code`),
  'MACRO.NATIVE_PACKAGE_URL': JSON.stringify(`https://www.npmjs.com/package/@anthropic-ai/claude-code`),
  'MACRO.ISSUES_EXPLAINER': JSON.stringify(`report the issue at https://github.com/anthropics/claude-code/issues`),
  'MACRO.FEEDBACK_CHANNEL': JSON.stringify(`https://github.com/anthropics/claude-code/issues`),
  'MACRO.VERSION_CHANGELOG': JSON.stringify('{}'),
}

// ── Build ──────────────────────────────────────────────────────────

console.log(`Building Claude Code v${version}...`)
console.log(`Feature flags enabled: ${Object.entries(featureFlags).filter(([, v]) => v).map(([k]) => k).join(', ')}`)

const result = await Bun.build({
  entrypoints: [resolve(import.meta.dir, '..', 'src', 'main.tsx')],
  outdir: resolve(import.meta.dir, '..', 'dist'),
  target: 'node',
  format: 'esm',
  sourcemap: 'linked',
  minify: true,
  define,
  // External packages that should not be bundled (native / optional)
  external: [
    '@anthropic-ai/claude-agent-sdk',
    '@anthropic-ai/mcpb',
    '@anthropic-ai/sandbox-runtime',
    '@anthropic-ai/bedrock-sdk',
    '@anthropic-ai/vertex-sdk',
    '@anthropic-ai/foundry-sdk',
    '@ant/computer-use-mcp',
    '@ant/computer-use-input',
    '@ant/computer-use-swift',
    '@ant/claude-for-chrome-mcp',
    '@aws-sdk/client-bedrock-runtime',
    '@aws-sdk/client-bedrock',
    '@aws-sdk/client-sts',
    '@azure/identity',
    'google-auth-library',
    'sharp',
    '@img/sharp-darwin-arm64',
    '@img/sharp-darwin-x64',
    '@img/sharp-linux-arm64',
    '@img/sharp-linux-x64',
    '@img/sharp-linuxmusl-arm64',
    '@img/sharp-linuxmusl-x64',
    '@img/sharp-win32-x64',
    'color-diff-napi',
    'modifiers-napi',
  ],
  loader: {
    '.md': 'text',
    '.txt': 'text',
    '.d.ts': 'ts',
  },
  plugins: [
    {
      name: 'bun-bundle-feature-flags',
      setup(build) {
        // Provide the bun:bundle module with feature() function
        build.onResolve({ filter: /^bun:bundle$/ }, () => ({
          path: 'bun:bundle',
          namespace: 'bun-bundle',
        }))
        build.onLoad({ filter: /.*/, namespace: 'bun-bundle' }, () => {
          // Generate a module that exports a feature() function
          // which returns the compile-time flag value
          const cases = Object.entries(featureFlags)
            .map(([k, v]) => `    case ${JSON.stringify(k)}: return ${v}`)
            .join('\n')
          return {
            contents: `export function feature(name) {\n  switch(name) {\n${cases}\n    default: return false\n  }\n}`,
            loader: 'js',
          }
        })
      },
    },
  ],
  naming: 'cli.js',
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

// Prepend shebang to the output
const outPath = resolve(import.meta.dir, '..', 'dist', 'cli.js')
const content = readFileSync(outPath, 'utf-8')
const { writeFileSync, chmodSync } = await import('fs')
const banner = `#!/usr/bin/env node
// (c) Anthropic PBC. All rights reserved.
// Version: ${version}
`
writeFileSync(outPath, banner + content)
chmodSync(outPath, 0o755)

console.log(`\nBuild complete: dist/cli.js`)
console.log(`Output size: ${(Bun.file(outPath).size / 1024 / 1024).toFixed(1)} MB`)
