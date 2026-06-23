#!/usr/bin/env node
// Simple image optimizer script using sharp if available.
// Run: npm run optimize-images -- --src=src/assets --out=src/assets/opt

import fs from 'fs'
import path from 'path'

async function main() {
  try {
    const sharp = await import('sharp')
    const args = process.argv.slice(2)
    const src = (args.find(a => a.startsWith('--src=')) || '--src=src/assets').split('=')[1]
    const out = (args.find(a => a.startsWith('--out=')) || '--out=src/assets/opt').split('=')[1]

    if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true })

    const exts = ['.jpg', '.jpeg', '.png', '.webp']
    const files = fs.readdirSync(src).filter(f => exts.includes(path.extname(f).toLowerCase()))

    console.log(`Optimizing ${files.length} images from ${src} → ${out}`)

    await Promise.all(files.map(async (file) => {
      const inPath = path.join(src, file)
      const outPath = path.join(out, file)
      const img = sharp.default(inPath)
      await img.resize({ width: 1600 }).toFile(outPath)
      console.log('wrote', outPath)
    }))

    console.log('Done')
  } catch (err) {
    console.error('Image optimization requires the "sharp" package. Install with: npm install --save-dev sharp')
    process.exit(1)
  }
}

main()
