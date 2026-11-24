// profile/lcd.svg: the profile's header as an old monochrome phone screen. The backlight comes on,
// scattered pixels fly into the three dots of the logo, the name is typed with a cursor, then the
// line under it, and the middle dot lights up red, the only colour on the screen.
// GitHub runs no script in a README, so it is CSS animation inside the SVG, played once.
// A pixel turns on with keyframes that hold the same value from start to end: a step-end over a
// short time left some at opacity 0 (Chrome, 11-06: the end of a 0.01 s step after 2.03 s rounds
// to just before it), so only the first letter of the name showed.
//   node scripts/lcd.mjs          writes profile/lcd.svg
import { writeFileSync } from 'node:fs'

const COLS = 104
const ROWS = 40
const PITCH = 7 // a pixel of 6 and a gap of 1, as on the old LCDs
const PIX = 6
const PAD = 24
const W = PAD * 2 + COLS * PITCH - 1
const H = PAD * 2 + ROWS * PITCH - 1

// 5x7 letters with two rows below the line for y and p.
const BIG = {
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#', '....#', '.###.'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '#...#', '####.', '#....', '#....'],
  t: ['.#...', '.#...', '####.', '.#...', '.#...', '.#..#', '..##.'],
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '####.'],
}
// 3x5 capitals for the line under the name.
const SMALL = {
  C: ['###', '#..', '#..', '#..', '###'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  F: ['###', '#..', '##.', '#..', '#..'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  E: ['###', '#..', '##.', '#..', '###'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  '·': ['...', '...', '.#.', '...', '...'],
  ' ': ['...', '...', '...', '...', '...'],
}
const DOT = ['..###..', '.#####.', '#######', '#######', '#######', '.#####.', '..###..']

const NAME = 'LusoCryptoLabs'
const LINE = 'CKB · FIBER · CELLULA'

// Seeded, so the file only changes when this script does.
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const px = (col) => PAD + col * PITCH
const py = (row) => PAD + row * PITCH
const s = (n) => `${Math.round(n * 1000) / 1000}s`
const cells = (rows) => rows.flatMap((r, y) => [...r].flatMap((c, x) => (c === '#' ? [[x, y]] : [])))

export function lcd() {
  const rand = rng(3310)
  const out = []
  const rect = (col, row, attrs = '') => `<rect x="${px(col)}" y="${py(row)}" width="${PIX}" height="${PIX}"${attrs}/>`

  // Timeline, in seconds.
  const ON = 0.35 // backlight on
  const NAME_AT = 1.85
  const STEP = 0.09
  const LINE_AT = NAME_AT + NAME.length * STEP + 0.25
  const LINE_STEP = 0.035
  const RED_AT = LINE_AT + LINE.length * LINE_STEP + 0.3

  // Signal bars on the left and the battery on the right.
  const status = []
  for (let i = 0; i < 4; i++) {
    for (let h = 0; h < i + 2; h++) status.push(rect(2 + i * 2, 5 - h, ` class="t" style="animation-delay:${s(ON + 0.1 + i * 0.12)}"`))
  }
  const bx = 92
  const outline = [...Array(9).keys()].flatMap((i) => [[bx + 1 + i, 1], [bx + 1 + i, 5]]).concat([[bx + 1, 2], [bx + 1, 3], [bx + 1, 4], [bx + 9, 2], [bx + 9, 3], [bx + 9, 4], [bx, 2], [bx, 3], [bx, 4]])
  for (const [c, r] of outline) status.push(rect(c, r, ` class="t" style="animation-delay:${s(ON + 0.1)}"`))
  for (let i = 0; i < 3; i++) for (let r = 2; r <= 4; r++) status.push(rect(bx + 7 - i * 2, r, ` class="t" style="animation-delay:${s(ON + 0.3 + i * 0.12)}"`))

  // The logo: three dots, assembled from pixels scattered over the screen.
  const logo = []
  const dots = [38, 49, 60]
  dots.forEach((col, d) => {
    for (const [x, y] of cells(DOT)) {
      const c = col + x
      const r = 8 + y
      const fromC = Math.floor(rand() * COLS)
      const fromR = 6 + Math.floor(rand() * (ROWS - 8))
      const delay = ON + 0.25 + rand() * 0.9
      logo.push(rect(c, r, ` class="f${d === 1 ? ' rd' : ''}" style="--x:${(fromC - c) * PITCH}px;--y:${(fromR - r) * PITCH}px;animation-delay:${s(delay)}${d === 1 ? `,${s(RED_AT)}` : ''}"`))
    }
  })

  // The name, typed: each letter shows when the cursor moves past it.
  const name = []
  const nameCol = 11
  ;[...NAME].forEach((ch, i) => {
    for (const [x, y] of cells(BIG[ch])) name.push(rect(nameCol + i * 6 + x, 18 + y, ` class="t" style="animation-delay:${s(NAME_AT + (i + 1) * STEP)}"`))
  })
  const cursor = []
  for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) cursor.push(rect(nameCol + x, 18 + y))

  // The line under it, revealed letter by letter.
  const line = []
  ;[...LINE].forEach((ch, i) => {
    for (const [x, y] of cells(SMALL[ch])) line.push(rect(nameCol + i * 4 + x, 31 + y, ` class="t" style="animation-delay:${s(LINE_AT + (i + 1) * LINE_STEP)}"`))
  })

  // A small figure in a white hat, in the clear band at the upper left: the security reviewer.
  // Its hat is the one white mark on the screen, as the middle logo dot is the one red. It turns
  // on last, after the red dot, like a signature.
  const figure = []
  const figCol = 2
  const figRow = 6
  const HAT = ['..#####..', '.#######.', '#########']
  const BODY = ['...###...', '..#####..', '..#####..', '...###...', '.#######.', '.#######.', '.#######.', '..#...#..', '..#...#..']
  const figAt = RED_AT + 0.25
  for (const [x, y] of cells(HAT)) figure.push(rect(figCol + x, figRow + y, ` class="wh" style="animation-delay:${s(figAt)}"`))
  for (const [x, y] of cells(BODY)) figure.push(rect(figCol + x, figRow + 3 + y, ` class="t" style="animation-delay:${s(figAt + 0.08)}"`))

  const travel = NAME.length * 6 * PITCH
  const glowX = px(dots[1] + 3) + PIX / 2
  const glowY = py(11) + PIX / 2

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title">`)
  out.push('<title id="title">LusoCryptoLabs</title>')
  out.push(`<style>
.px{fill:#1d2915}
.t{opacity:0;animation:on 1ms linear forwards}
.wh{fill:#f4f2e6;opacity:0;animation:on 1ms linear forwards}
.f{animation:fly .45s steps(4,end) both}
.rd{animation-name:fly,red;animation-duration:.45s,1ms;animation-timing-function:steps(4,end),linear;animation-fill-mode:both,forwards}
.lit{animation:lit .3s steps(3,end) ${s(0.05)} both}
.glow{opacity:0;animation:on 1ms linear ${s(RED_AT)} forwards}
.cur{opacity:0;animation:on 1ms linear ${s(NAME_AT)} forwards}
.mv{animation:mv ${s(NAME.length * STEP)} steps(${NAME.length},end) ${s(NAME_AT)} both}
.bl{animation:bl 1s step-end ${s(NAME_AT + NAME.length * STEP)} infinite}
@keyframes on{from,to{opacity:1}}
@keyframes fly{from{transform:translate(var(--x),var(--y))}to{transform:none}}
@keyframes red{from,to{fill:#e10600}}
@keyframes lit{from{opacity:.62}to{opacity:0}}
@keyframes mv{from{transform:none}to{transform:translateX(${travel}px)}}
@keyframes bl{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){
.t,.f,.rd,.lit,.glow,.cur,.mv,.bl,.wh{animation:none}
.t,.glow,.cur,.wh{opacity:1}.lit{opacity:0}.rd{fill:#e10600}.mv{transform:translateX(${travel}px)}
}
</style>`)
  out.push(`<defs>
<pattern id="grid" x="${PAD}" y="${PAD}" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><rect width="${PIX}" height="${PIX}" fill="#a3bb7c"/></pattern>
<radialGradient id="light" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#c3d99b"/><stop offset="1" stop-color="#9fb878"/></radialGradient>
<filter id="blur" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="9"/></filter>
</defs>`)
  // The phone around the screen, then the screen: backlight, the grid of pixels that are off, the
  // glow behind the red dot, and the pixels that are on.
  out.push(`<rect width="${W}" height="${H}" rx="22" fill="#262a25"/>`)
  out.push(`<rect x="${PAD - 10}" y="${PAD - 10}" width="${COLS * PITCH + 19}" height="${ROWS * PITCH + 19}" rx="10" fill="url(#light)"/>`)
  out.push(`<rect x="${PAD}" y="${PAD}" width="${COLS * PITCH}" height="${ROWS * PITCH}" fill="url(#grid)" opacity=".55"/>`)
  out.push(`<circle class="glow" cx="${glowX}" cy="${glowY}" r="30" fill="#e10600" fill-opacity=".45" filter="url(#blur)"/>`)
  out.push(`<g class="px">`)
  out.push(...status, ...logo, ...name, ...line, ...figure)
  out.push(`<g class="cur"><g class="mv"><g class="bl">${cursor.join('')}</g></g></g>`)
  out.push('</g>')
  out.push(`<rect class="lit" x="${PAD - 10}" y="${PAD - 10}" width="${COLS * PITCH + 19}" height="${ROWS * PITCH + 19}" rx="10" fill="#1d2915"/>`)
  out.push('</svg>')
  return out.join('\n') + '\n'
}

if (process.argv[1]?.endsWith('lcd.mjs')) {
  writeFileSync(new URL('../profile/lcd.svg', import.meta.url), lcd())
  console.log('profile/lcd.svg written')
}
