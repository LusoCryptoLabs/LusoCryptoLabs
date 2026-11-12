// The Writing section: which forum topics show, in which order, how they read, and that a forum
// that fails does not break the page.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articles, clean, render, topics, writing } from '../scripts/update.mjs'

const talk = {
  accounts: { LusoCryptoLabs: 'all', T_Silva: [11142] },
  skip: [10450],
}

const byUser = {
  LusoCryptoLabs: [
    { id: 11068, slug: 'one-fiber-lsp', title: 'One Fiber LSP, 11,496 channels', created_at: '2026-10-29T10:00:00Z' },
    { id: 10450, slug: 'hello', title: 'Hello from LusoCryptoLabs', created_at: '2026-07-02T10:00:00Z' },
  ],
  T_Silva: [
    { id: 11142, slug: 'spark-ckb-adversary', title: 'ckb-adversary', created_at: '2026-11-07T10:00:00Z' },
    { id: 7727, slug: 'a-talk-show', title: 'not ours to list', created_at: '2024-02-12T10:00:00Z' },
  ],
}

test('every topic of an account set to "all", only the named ones of the others, skips out, newest first', () => {
  const list = articles(byUser, talk)
  assert.deepEqual(list.map((a) => a.title), ['ckb-adversary', 'One Fiber LSP, 11,496 channels'])
  assert.equal(list[1].url, 'https://talk.nervos.org/t/one-fiber-lsp/11068')
  assert.equal(list[1].date, '2026-10-29')
})

test('control: without the skip, the skipped topic shows', () => {
  assert.equal(articles(byUser, { ...talk, skip: [] }).length, 3)
})

test('a long dash between words becomes a colon', () => {
  const em = String.fromCharCode(0x2014)
  assert.equal(clean(`Scryve Tools ${em} wallet auth`), 'Scryve Tools: wallet auth')
  assert.equal(clean('pay-as-you-read - a demo'), 'pay-as-you-read - a demo')
})

test('the section shows the newest few and links the record page; nothing when there is nothing', () => {
  const list = articles(byUser, talk)
  const lines = writing(list, 1, 'https://lusocryptolabs.com/record.html')
  assert.equal(lines[0], '### Writing')
  assert.equal(lines.filter((l) => l.startsWith('- ')).length, 1)
  assert.ok(lines.includes('All of it, with our research and packages: [lusocryptolabs.com/record.html](https://lusocryptolabs.com/record.html).'))
  assert.deepEqual(writing([], 5, 'x'), [])
})

test('the README carries the section above the totals', () => {
  const md = render([], { author: 'LusoCryptoLabs', latest: 5, groups: [], other: 'Other' }, 'HEADER', articles(byUser, talk))
  assert.ok(md.indexOf('### Writing') > md.indexOf('HEADER'))
  assert.ok(md.indexOf('### Writing') < md.indexOf('So far:'))
})

test('topics reads every page of each account', async () => {
  const seen = []
  const pages = { 0: { topic_list: { topics: [{ id: 1 }], more_topics_url: '/next' } }, 1: { topic_list: { topics: [{ id: 2 }] } } }
  const got = await topics({ accounts: { A: 'all' } }, async (url) => {
    seen.push(url)
    return pages[Number(url.split('page=')[1])]
  })
  assert.deepEqual(got.A.map((t) => t.id), [1, 2])
  assert.equal(seen.length, 2)
})
