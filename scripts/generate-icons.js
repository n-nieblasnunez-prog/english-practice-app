/**
 * Generates PWA icon PNGs from the SVG favicon.
 * Run once after install: node scripts/generate-icons.js
 * Requires: npm install -D sharp (already in devDependencies if you add it)
 */
import { readFileSync, writeFileSync } from 'fs'
import { createCanvas } from 'canvas'

// Simple canvas-based icon generator (no extra deps)
function makePng(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#6366f1'
  roundRect(ctx, 0, 0, size, size, size * 0.2)
  ctx.fill()

  const s = size / 32
  ctx.strokeStyle = 'white'
  ctx.fillStyle = 'white'
  ctx.lineWidth = 2 * s
  ctx.lineCap = 'round'

  // Mic body
  ctx.beginPath()
  ctx.roundRect(12 * s, 8 * s, 8 * s, 12 * s, 4 * s)
  ctx.fill()

  // Mic arc
  ctx.beginPath()
  ctx.arc(16 * s, 20 * s, 6 * s, 0, Math.PI)
  ctx.stroke()

  // Stem
  ctx.beginPath()
  ctx.moveTo(16 * s, 26 * s)
  ctx.lineTo(16 * s, 23 * s)
  ctx.stroke()

  // Base line
  ctx.beginPath()
  ctx.moveTo(12 * s, 26 * s)
  ctx.lineTo(20 * s, 26 * s)
  ctx.stroke()

  return canvas.toBuffer('image/png')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

writeFileSync('public/pwa-192x192.png', makePng(192))
writeFileSync('public/pwa-512x512.png', makePng(512))
writeFileSync('public/apple-touch-icon.png', makePng(180))
console.log('Icons generated successfully.')
