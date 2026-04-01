#!/usr/bin/env bun
/**
 * Run the CLI entrypoint with the same MACRO.* defines as scripts/build.ts.
 * Prefer `bun run src/entrypoints/cli.tsx` — it self-reexecs with defines when needed.
 */
import { resolve } from 'path'

import { getMacroDefineBunArgs } from './macro-defines.ts'

const root = resolve(import.meta.dir, '..')
const defineArgs = getMacroDefineBunArgs(root)
const entry = resolve(root, 'src/entrypoints/cli.tsx')
const userArgs = process.argv.slice(2)

const proc = Bun.spawnSync({
  cmd: ['bun', ...defineArgs, entry, ...userArgs],
  cwd: root,
  stdin: 'inherit',
  stdout: 'inherit',
  stderr: 'inherit',
})
process.exit(proc.exitCode ?? 1)
