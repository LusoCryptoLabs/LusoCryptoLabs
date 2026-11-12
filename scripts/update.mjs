// README.md from profile/header.md and our pull requests and issues in other projects, as GitHub's
// search lists them (public data). Run each day by .github/workflows/update.yml. Locally:
//   GITHUB_TOKEN=<token> node scripts/update.mjs          writes README.md
//   node scripts/update.mjs --from <search items json>    the same from saved items
// The page stays short however long the list grows: the totals on top, per project the newest
// `latest` merged and open pull requests, the rest and the reports in closed sections.
// Above them, the newest articles our accounts started on Nervos Talk (config `talk`, the same keys
// lcl-activity reads for the record page on lusocryptolabs.com).
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
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

const DASHES = [String.fromCharCode(0x2014), String.fromCharCode(0x2013)]
/** Our house style has no long dashes: one between words becomes a colon. */
export const clean = (t) => DASHES.reduce((x, d) => x.split(' ' + d + ' ').join(': ').split(d).join(': '), t.trim())

/** The topics our accounts started, as config `talk` names them: every topic of an account set to "all", else the ids listed. */
export function articles(topicsByUser, talk = {}) {
  const base = (talk.base ?? 'https://talk.nervos.org').replace(/[/]$/, '')
  const skip = new Set(talk.skip ?? [])
  const out = []
  for (const [user, which] of Object.entries(talk.accounts ?? {})) {
    for (const t of topicsByUser[user] ?? []) {
      if (skip.has(t.id) || (which !== 'all' && !which.includes(t.id))) continue
      out.push({ date: day(t.created_at), title: clean(t.title), url: `${base}/t/${t.slug}/${t.id}` })
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date))
}

/** Every topic each account in config `talk` started, page by page. */
export async function topics(talk = {}, getJson = (url) => fetch(url, { headers: { accept: 'application/json', 'user-agent': 'lusocryptolabs-profile' } }).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url}: ${r.status}`))))) {
  const base = (talk.base ?? 'https://talk.nervos.org').replace(/[/]$/, '')
  const byUser = {}
  for (const user of Object.keys(talk.accounts ?? {})) {
    byUser[user] = []
    for (let page = 0; page < 10; page++) {
      const body = await getJson(`${base}/topics/created-by/${encodeURIComponent(user)}.json?page=${page}`)
      byUser[user].push(...body.topic_list.topics)
      if (!body.topic_list.more_topics_url) break
    }
  }
  return byUser
}

/** The Writing section: the newest `latest` articles and the record page with all of it. */
export function writing(list, latest, record) {
  if (!list.length) return []
  return ['### Writing', '', ...list.slice(0, latest).map((a) => `- [${escape(a.title)}](${a.url}) (${a.date})`), '',
    `All of it, with our research and packages: [${record.replace(/^https:[/][/]/, '')}](${record}).`, '']
}

/** A list, its newest `latest` items shown and the rest in a closed section. */
function shortList(lines, latest, more) {
  if (lines.length <= latest) return [...lines, '']
  const rest = lines.slice(latest)
  return [...lines.slice(0, latest), '', `<details><summary>${more(rest.length)}</summary>`, '', ...rest, '', '</details>', '']
}

/** A list kept in a closed section, its summary always shown. */
function closedList(lines, summary) {
  return [`<details><summary>${summary}</summary>`, '', ...lines, '', '</details>', '']
}

/** The README for these search items. */
export function render(items, config, header, articleList = []) {
  const latest = config.latest ?? 5
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

  const merged = kept.filter((i) => i.pull_request?.merged_at)
  const openPrs = kept.filter((i) => i.pull_request && i.state === 'open')
  const reports = kept.filter((i) => !i.pull_request)
  const repos = new Set(merged.map(repoOf)).size
  const out = [header.trim(), '']
  out.push(...writing(articleList, latest, config.record ?? 'https://lusocryptolabs.com/record.html'))
  out.push(`So far: ${plural(merged.length, 'pull request', 'pull requests')} merged in ${plural(repos, 'repository', 'repositories')}, ${openPrs.length} open, and ${plural(reports.length, 'report', 'reports')}.`, '')

  for (const g of groups) {
    if (!g.items.length && !(config.notes ?? {})[g.title]) continue
    const main = g.repos[0]
    out.push(main ? `### ${g.title} ([${main}](https://github.com/${main}))` : `### ${g.title}`, '')
    const label = (i) => (repoOf(i) === main ? `#${i.number}` : main ? `${repoOf(i)}#${i.number}` : `${repoOf(i).split('/')[1]}#${i.number}`)
    const line = (i, state) => {
      const after = (config.after ?? {})[keyOf(i)]
      return `- [${label(i)}](${i.html_url}) ${escape(i.title)} (${state})${after ? `, ${after}` : ''}`
    }
    const gMerged = g.items.filter((i) => i.pull_request?.merged_at).sort((a, b) => b.pull_request.merged_at.localeCompare(a.pull_request.merged_at))
    const gOpen = g.items.filter((i) => i.pull_request && i.state === 'open')
    const gReports = g.items.filter((i) => !i.pull_request)
    const notes = (config.notes ?? {})[g.title] ?? []
    if (gMerged.length) out.push('Merged:', '', ...shortList(gMerged.map((i) => line(i, `merged ${day(i.pull_request.merged_at)}`)), latest, (n) => `${n} more merged`))
    if (gOpen.length) out.push('Open:', '', ...shortList(gOpen.map((i) => line(i, 'open')), latest, (n) => `${n} more open`))
    if (gReports.length || notes.length) {
      const stillOpen = gReports.filter((i) => i.state === 'open').length
      const summary = gReports.length ? `${plural(gReports.length, 'report', 'reports')} (${stillOpen} open)` : 'Reports'
      out.push(...closedList([...gReports.map((i) => line(i, i.state)), ...notes.map((n) => `- ${n}`)], summary))
    }
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
  // The forum down keeps yesterday's Writing section rather than dropping it.
  let list = null
  try {
    list = articles(await topics(config.talk), config.talk)
  } catch (e) {
    console.error(`Nervos Talk: ${e.message}; keeping the Writing section as it was`)
  }
  let md = render(items, config, header, list ?? [])
  if (list === null) {
    const prev = readFileSync(new URL('README.md', ROOT), 'utf8')
    const start = prev.indexOf('### Writing')
    const end = prev.indexOf('So far:')
    if (start >= 0 && end > start) md = md.replace('So far:', prev.slice(start, end) + 'So far:')
  }
  writeFileSync(new URL('README.md', ROOT), md)
  console.log(`README.md: ${items.length} items read`)
}
