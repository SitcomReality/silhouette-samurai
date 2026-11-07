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
    if (asset.startsWith('#') || asset.startsWith('data:')) continue
    if (/^(?:https?:)?\/\//.test(asset)) {
      failures.push(`index.html: external asset "${asset}" — vendor it locally instead`)
      continue
    }
    const assetPath = path.resolve(root, asset.replace(/^\.?\//, ''))
    if (!fs.existsSync(assetPath)) failures.push(`index.html: missing local asset "${asset}"`)
  }
  // Import map entries must also be local files (xmlns identifiers are not fetched).
  const importMapPattern = /<script type="importmap">([\s\S]*?)<\/script>/g
  while ((match = importMapPattern.exec(html))) {
    let importMap
    try {
      importMap = JSON.parse(match[1])
    } catch {
      failures.push('index.html: import map is not valid JSON')
      continue
    }
    for (const [specifier, target] of Object.entries(importMap.imports ?? {})) {
      if (/^(?:https?:)?\/\//.test(target)) {
        failures.push(`index.html: external import "${specifier}" -> "${target}" — vendor it locally instead`)
        continue
      }
      const targetPath = path.resolve(root, target.replace(/^\.?\//, ''))
      if (!fs.existsSync(targetPath)) failures.push(`index.html: missing import map target "${target}" for "${specifier}"`)
    }
  }
}

// Runtime code must not reference external URLs (vendor/ is excluded: it carries
// attribution URLs in comments; scripts/ is the localhost dev server).
const runtimeFiles = walk(root).filter((file) => {
  if (!/\.(?:js|mjs|css)$/.test(file)) return false
  const relative = path.relative(root, file)
  return !relative.startsWith(`vendor${path.sep}`) && !relative.startsWith(`scripts${path.sep}`)
})
const externalPattern = /(?:import\s+(?:[^'"]*?\s+from\s+)?|export\s+[^'"]*?\s+from\s+|fetch\s*\(\s*|url\s*\(\s*|@import\s+)[\"']?(https?:\/\/[^\s\"')]+|\/\/[^\s\"')]+)/g
for (const file of runtimeFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relative = path.relative(root, file)
  let match
  while ((match = externalPattern.exec(source))) {
    failures.push(`${relative}: external URL "${match[1]}" — vendor it locally instead`)
  }
}

if (failures.length > 0) {
  console.error(`Check failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):\n`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Check passed: ${jsFiles.length} JS files parse and all local imports/assets resolve.`)
