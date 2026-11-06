// The animated header (scripts/lcd.mjs): the committed file is what the script writes, and it holds
// nothing GitHub would strip or fetch.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { lcd } from '../scripts/lcd.mjs'

const committed = readFileSync(new URL('../profile/lcd.svg', import.meta.url), 'utf8').replace(/\r\n/g, '\n')

test('profile/lcd.svg is what scripts/lcd.mjs writes', () => {
  assert.equal(committed, lcd(), 'run: node scripts/lcd.mjs')
})

test('no script, no outside resource, a title for screen readers, and a still frame for reduced motion', () => {
  assert.doesNotMatch(committed, /<script|foreignObject|href="http|url\(http|@import/i)
  assert.match(committed, /<title id="title">LusoCryptoLabs<\/title>/)
  assert.match(committed, /@media \(prefers-reduced-motion:reduce\)/)
})

test('a pixel turns on with keyframes that hold, never a step at the end of a short time', () => {
  // Chrome left letters off with "on .01s step-end" (11-06): the end of the step rounds before it.
  assert.match(committed, /@keyframes on\{from,to\{opacity:1\}\}/)
  assert.doesNotMatch(committed, /on \.01s step-end/)
})
