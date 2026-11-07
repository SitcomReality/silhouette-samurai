#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function walk(dir) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath))
    else files.push(fullPath)
  }
  return files
}

const jsFiles = walk(root).filter((file) => file.endsWith('.js') || file.endsWith('.mjs'))

for (const file of jsFiles) {
  const relative = path.relative(root, file)
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' })
  } catch (error) {
    const detail = error.stderr?.toString().trim() || error.message
    failures.push(`${relative}: syntax error\n${detail}`)
  }
}

const importPattern = /(?:^|\n)\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g
for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file)
  let match
  while ((match = importPattern.exec(source))) {
    const specifier = match[1]
    if (specifier.startsWith('.') && !fs.existsSync(path.resolve(path.dirname(file), specifier))) {
      failures.push(`${relative}: unresolved import "${specifier}"`)
    }
  }
}

const indexHtml = path.join(root, 'index.html')
if (!fs.existsSync(indexHtml)) {
  failures.push('index.html is missing')
} else {
  const html = fs.readFileSync(indexHtml, 'utf8')
  const assetPattern = /<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["']/gi
  let match
  while ((match = assetPattern.exec(html))) {
    const asset = match[1]
    if (/^(?:https?:)?\/\//.test(asset) || asset.startsWith('#') || asset.startsWith('data:')) continue
    const assetPath = path.resolve(root, asset.replace(/^\.?\//, ''))
    if (!fs.existsSync(assetPath)) failures.push(`index.html: missing local asset "${asset}"`)
  }
}

if (failures.length > 0) {
  console.error(`Check failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):\n`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Check passed: ${jsFiles.length} JS files parse and all local imports/assets resolve.`)
