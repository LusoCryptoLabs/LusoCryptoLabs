// The README's rules on saved search items: what is kept, where, in which order, how it reads, and
// that it stays short however long the list grows.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { render, search } from '../scripts/update.mjs'

const config = {
  author: 'LusoCryptoLabs',
  latest: 2,
  groups: [{ title: 'Fiber', repos: ['nervosnetwork/fiber', 'chenyukang/fiber'] }],
  other: 'Other CKB projects',
  skip: ['nervosnetwork/fiber-website#22'],
  skipTitles: ['^\\[FR\\]'],
  after: { 'nervosnetwork/fiber#1718': 'from our report #1717' },
  notes: { Fiber: ['Findings on #1623'] },
}
const item = (repo, number, title, o = {}) => ({
  repository_url: `https://api.github.com/repos/${repo}`,
  html_url: `https://github.com/${repo}/${o.pr ? 'pull' : 'issues'}/${number}`,
  number,
  title,
  state: o.state ?? 'open',
  ...(o.pr ? { pull_request: { merged_at: o.merged ?? null } } : {}),
})
const items = [
  item('nervosnetwork/fiber', 1707, 'fix: hold cells', { pr: true, state: 'closed', merged: '2026-11-05T23:04:00Z' }),
  item('nervosnetwork/fiber', 1718, 'fix: keep subscribers', { pr: true, state: 'closed', merged: '2026-11-03T13:11:00Z' }),
  item('chenyukang/fiber', 9, 'fix(lsp): look tenants up', { pr: true, state: 'closed', merged: '2026-11-01T10:00:00Z' }),
  item('nervosnetwork/fiber', 1713, 'fix: reply with witnesses', { pr: true, state: 'closed' }),
  item('nervosnetwork/fiber', 1724, 'Trampoline holds a <second> payment'),
  item('nervosnetwork/fiber', 1717, 'Store change subscribers stop', { state: 'closed' }),
  item('nervosnetwork/fiber-website', 22, 'Using the Fiber mark'),
  item('RaheemJnr/pocket-node', 530, '[FR] Resolve .cell names'),
  item('nervosnetwork/docs.nervos.org', 966, 'docs: add known pitfalls', { pr: true }),
  item('LusoCryptoLabs/cellula-ui', 17, 'feat: our own'),
]

test('kept, grouped, ordered and cut as the rules say', () => {
  const md = render(items, config, '## Header\n')
  assert.equal(md, [
    '## Header',
    '',
    'So far: 3 pull requests merged in 2 repositories, 1 open, and 2 reports.',
    '',
    '### Fiber ([nervosnetwork/fiber](https://github.com/nervosnetwork/fiber))',
    '',
    'Merged:',
    '',
    '- [#1707](https://github.com/nervosnetwork/fiber/pull/1707) fix: hold cells (merged 2026-11-05)',
    '- [#1718](https://github.com/nervosnetwork/fiber/pull/1718) fix: keep subscribers (merged 2026-11-03), from our report #1717',
    '',
    '<details><summary>1 more merged</summary>',
    '',
    '- [chenyukang/fiber#9](https://github.com/chenyukang/fiber/pull/9) fix(lsp): look tenants up (merged 2026-11-01)',
    '',
    '</details>',
    '',
    '<details><summary>2 reports (1 open)</summary>',
    '',
    '- [#1724](https://github.com/nervosnetwork/fiber/issues/1724) Trampoline holds a \\<second\\> payment (open)',
    '- [#1717](https://github.com/nervosnetwork/fiber/issues/1717) Store change subscribers stop (closed)',
    '- Findings on #1623',
    '',
    '</details>',
    '',
    '### Other CKB projects',
    '',
    'Open:',
    '',
    '- [docs.nervos.org#966](https://github.com/nervosnetwork/docs.nervos.org/pull/966) docs: add known pitfalls (open)',
    '',
    'All of it, as GitHub lists it: [pull requests and issues by LusoCryptoLabs](https://github.com/search?q=author%3ALusoCryptoLabs+-user%3ALusoCryptoLabs&type=issues).',
    '',
  ].join('\n'))
})

test('control: without the rules, what they leave out shows', () => {
  const md = render(items, { ...config, skip: [], skipTitles: [] }, '')
  assert.match(md, /fiber-website#22/)
  assert.match(md, /pocket-node#530/)
  // Closed without a merge and our own repositories stay out whatever the config.
  assert.doesNotMatch(md, /#1713/)
  assert.doesNotMatch(md, /cellula-ui/)
})

test('a hundred merged pull requests: five shown, the rest closed, the page stays short', () => {
  const many = Array.from({ length: 100 }, (_, n) => item('nervosnetwork/fiber', 2000 + n, `fix: ${n}`, { pr: true, state: 'closed', merged: `2026-12-${String(1 + (n % 28)).padStart(2, '0')}T00:00:${String(n % 60).padStart(2, '0')}Z` }))
  const md = render(many, { ...config, latest: 5 }, '')
  const shown = md.split('<details>')[0]
  assert.equal((shown.match(/^- \[/gm) ?? []).length, 5)
  assert.match(md, /<details><summary>95 more merged<\/summary>/)
  assert.match(md, /^So far: 100 pull requests merged in 1 repository, 0 open, and 0 reports\.$/m)
  // Control: with no limit, all hundred are on the page.
  const all = render(many, { ...config, latest: 1000 }, '')
  assert.equal((all.match(/^- \[/gm) ?? []).length, 100)
})

test('search reads every page', async () => {
  const pages = [{ total_count: 150, items: Array(100).fill({}) }, { total_count: 150, items: Array(50).fill({}) }]
  const asked = []
  const got = await search('q', null, async (url) => (asked.push(url), pages[asked.length - 1]))
  assert.equal(got.length, 150)
  assert.equal(asked.length, 2)
  assert.match(asked[1], /page=2/)
})
