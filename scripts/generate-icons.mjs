import sharp from 'sharp'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const svg = readFileSync(join(root, 'public', 'icon.svg'))

const icons = [
  { size: 192,  file: 'icon-192.png' },
  { size: 512,  file: 'icon-512.png' },
  { size: 180,  file: 'apple-touch-icon.png' },
]

for (const { size, file } of icons) {
  await sharp(svg).resize(size, size).png().toFile(join(root, 'public', file))
  console.log(`  ✓ ${file}`)
}
