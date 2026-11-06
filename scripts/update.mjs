// README.md from profile/header.md and our pull requests and issues in other projects, as GitHub's
// search lists them (public data). Run each day by .github/workflows/update.yml. Locally:
//   GITHUB_TOKEN=<token> node scripts/update.mjs          writes README.md
//   node scripts/update.mjs --from <search items json>    the same from saved items
import { readFileSync, writeFileSync } from 'node:fs'

const ROOT = new URL('..', import.meta.url)

/** Every item of a search, page by page. */
export async function search(q, token, fetchJson = defaultFetch) {
  const items = []
  for (let page = 1; page <= 10; page++) {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}&sort=created&order=desc`
    const body = await fetchJson(url, token)
    items.push(...body.items)
    if (items.length >= body.total_count || body.items.length < 100) break
  }
  return items
}

async function defaultFetch(url, token) {
  const r = await fetch(url, { headers: { accept: 'application/vnd.github+json', 'user-agent': 'lusocryptolabs-profile', ...(token ? { authorization: `Bearer ${token}` } : {}) } })
  if (!r.ok) throw new Error(`${url}: ${r.status} ${await r.text()}`)
  return r.json()
}

const repoOf = (item) => item.repository_url.split('/').slice(-2).join('/')
const keyOf = (item) => `${repoOf(item)}#${item.number}`
const day = (iso) => iso.slice(0, 10)
const escape = (s) => s.replace(/([\\[\]<>])/g, '\\$1')

/** The README for these search items. */
export function render(items, config, header) {
  const skipTitles = (config.skipTitles ?? []).map((s) => new RegExp(s))
  const kept = items.filter((i) => {
    if (repoOf(i).split('/')[0].toLowerCase() === config.author.toLowerCase()) return false
    if ((config.skip ?? []).includes(keyOf(i))) return false
    if (skipTitles.some((r) => r.test(i.title))) return false
    // A pull request closed without its merge is no contribution.
    if (i.pull_request && i.state === 'closed' && !i.pull_request.merged_at) return false
    return true
  })
  const groups = [...config.groups.map((g) => ({ ...g, items: [] })), { title: config.other, repos: [], items: [] }]
  for (const i of kept) (groups.find((g) => g.repos.includes(repoOf(i))) ?? groups[groups.length - 1]).items.push(i)

  const out = [header.trim(), '']
  for (const g of groups) {
    if (!g.items.length && !(config.notes ?? {})[g.title]) continue
    const main = g.repos[0]
    out.push(main ? `### ${g.title} ([${main}](https://github.com/${main}))` : `### ${g.title}`, '')
    const label = (i) => (repoOf(i) === main ? `#${i.number}` : main ? `${repoOf(i)}#${i.number}` : `${repoOf(i).split('/')[1]}#${i.number}`)
    const line = (i, state) => {
      const after = (config.after ?? {})[keyOf(i)]
      return `- [${label(i)}](${i.html_url}) ${escape(i.title)} (${state})${after ? `, ${after}` : ''}`
    }
    const merged = g.items.filter((i) => i.pull_request?.merged_at).sort((a, b) => b.pull_request.merged_at.localeCompare(a.pull_request.merged_at))
    const open = g.items.filter((i) => i.pull_request && i.state === 'open')
    const reports = g.items.filter((i) => !i.pull_request)
    const notes = (config.notes ?? {})[g.title] ?? []
    if (merged.length) out.push('Merged:', '', ...merged.map((i) => line(i, `merged ${day(i.pull_request.merged_at)}`)), '')
    if (open.length) out.push('Open:', '', ...open.map((i) => line(i, 'open')), '')
    if (reports.length || notes.length) out.push('Reports:', '', ...reports.map((i) => line(i, i.state)), ...notes.map((n) => `- ${n}`), '')
  }
  const q = encodeURIComponent(`author:${config.author} -user:${config.author}`).replace(/%20/g, '+')
  out.push(`All of it, as GitHub lists it: [pull requests and issues by ${config.author}](https://github.com/search?q=${q}&type=issues).`, '')
  return out.join('\n')
}

if (import.meta.url === new URL(process.argv[1], 'file:').href || process.argv[1]?.endsWith('update.mjs')) {
  const config = JSON.parse(readFileSync(new URL('profile/config.json', ROOT), 'utf8'))
  const header = readFileSync(new URL('profile/header.md', ROOT), 'utf8')
  const from = process.argv.indexOf('--from')
  const items = from > 0 ? JSON.parse(readFileSync(process.argv[from + 1], 'utf8')) : await search(`author:${config.author} -user:${config.author}`, process.env.GITHUB_TOKEN)
  writeFileSync(new URL('README.md', ROOT), render(items, config, header))
  console.log(`README.md: ${items.length} items read`)
}
