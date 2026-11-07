<a href="https://lusocryptolabs.com"><img src="profile/lcd.svg" width="720" alt="LusoCryptoLabs"></a>

We build on Nervos CKB: Cellula ([cellula.id](https://cellula.id)), a wallet with `.cell` names
and Fiber payments, and the hosted Fiber LSP behind it. What we find while running them goes back
to the projects we build on.

The list below updates itself each day from GitHub's public data.

So far: 11 pull requests merged in 5 repositories, 3 open, and 19 reports.

### Fiber ([nervosnetwork/fiber](https://github.com/nervosnetwork/fiber))

Merged:

- [#1707](https://github.com/nervosnetwork/fiber/pull/1707) fix: hold cells across funding and the watchtower (merged 2026-11-05)
- [#1718](https://github.com/nervosnetwork/fiber/pull/1718) fix: keep store change subscribers through a burst (merged 2026-11-03), from our report [#1717](https://github.com/nervosnetwork/fiber/issues/1717)
- [#1719](https://github.com/nervosnetwork/fiber/pull/1719) fix: build one CKB client for the watchtower round (merged 2026-11-03)
- [chenyukang/fiber#9](https://github.com/chenyukang/fiber/pull/9) fix(lsp): look tenants up by key without reading them all (merged 2026-11-01)
- [#1715](https://github.com/nervosnetwork/fiber/pull/1715) fix: replace secp placeholders when merging funding witnesses (merged 2026-10-29)

<details><summary>2 more merged</summary>

- [#1708](https://github.com/nervosnetwork/fiber/pull/1708) fix: fail a funding tx that conflicts with one in the pool (merged 2026-10-29)
- [#1703](https://github.com/nervosnetwork/fiber/pull/1703) feat: add an option to sync store writes to disk (merged 2026-10-26)

</details>

<details><summary>5 reports (3 open)</summary>

- [#1724](https://github.com/nervosnetwork/fiber/issues/1724) Trampoline holds a second payment of a paid invoice until expiry (open)
- [#1722](https://github.com/nervosnetwork/fiber/issues/1722) Payer TLC timeout is replayed at every CheckChannels and fails a reused attempt (open)
- [#1720](https://github.com/nervosnetwork/fiber/issues/1720) has_pending_tlc_for_payment_hash reads every channel state when the hash is not in the current channel (open)
- [#1717](https://github.com/nervosnetwork/fiber/issues/1717) Store change subscribers stop for good after a burst of 17 changes (closed)
- [#1679](https://github.com/nervosnetwork/fiber/issues/1679) Hosted LSP (#1623): three findings from a testnet run (closed)
- Findings on the LSP support pull request, [#1623](https://github.com/nervosnetwork/fiber/pull/1623)

</details>

### CCC ([ckb-devrel/ccc](https://github.com/ckb-devrel/ccc))

Merged:

- [#575](https://github.com/ckb-devrel/ccc/pull/575) feat(core): add addressResolver to ClientConfig (merged 2026-09-26), from [#548](https://github.com/ckb-devrel/ccc/issues/548)
- [#540](https://github.com/ckb-devrel/ccc/pull/540) docs(core): say that a dep with a type id ignores its configured outpoint (merged 2026-09-18)

Open:

- [#596](https://github.com/ckb-devrel/ccc/pull/596) fix(core): verify JoyID signatures against the given key and message (open)

<details><summary>3 reports (1 open)</summary>

- [#613](https://github.com/ckb-devrel/ccc/issues/613) Verifying messages signed by a passkey smart-account wallet (closed)
- [#595](https://github.com/ckb-devrel/ccc/issues/595) Drop @joyid/ckb: core and joy-id use two small helpers from it (open)
- [#548](https://github.com/ckb-devrel/ccc/issues/548) Let Address.fromString resolve human-readable names through a registered resolver (closed)

</details>

### Other CKB projects

Merged:

- [ckbdapps#7](https://github.com/CKBFansDAO/ckbdapps/pull/7) content: Cellula.id links, contracts and Dev Tools (merged 2026-10-29)
- [CrowdCell#10](https://github.com/alesfer001/CrowdCell/pull/10) feat: show .cell names for creators and backers (merged 2026-10-13)

Open:

- [ckb-explorer-frontend#2143](https://github.com/nervosnetwork/ckb-explorer-frontend/pull/2143) fix: point the cells scripts at their upgraded deployments (open)
- [docs.nervos.org#966](https://github.com/nervosnetwork/docs.nervos.org/pull/966) docs: add known pitfalls to the script testing guide (open)

<details><summary>11 reports (7 open)</summary>

- [ckb-proxy-locks#8](https://github.com/ckb-devrel/ckb-proxy-locks/issues/8) docs: document the integrator hazards of output-type-proxy-lock and the delegation semantics (open)
- [omnilock#12](https://github.com/nervosnetwork/omnilock/issues/12) ACP payment into two cells of one owner fails with -3 (open)
- [spore-contract#77](https://github.com/sporeprotocol/spore-contract/issues/77) Testnet Spore and Cluster code cells are under the dev chain's published key (open)
- [ckb-light-client#303](https://github.com/nervosnetwork/ckb-light-client/issues/303) Publish a release with the June and August fixes (open)
- [fluxo#10](https://github.com/Freakah/fluxo/issues/10) CI: npm audit fails on zod 4.6.5 (open)
- [fluxo#9](https://github.com/Freakah/fluxo/issues/9) Deleting one bank's data resets recurring items of every bank (open)
- [fluxo#8](https://github.com/Freakah/fluxo/issues/8) Paid back accepts payments larger than the expense (open)
- [CrowdCell#9](https://github.com/alesfer001/CrowdCell/issues/9) Show `.cell` names for campaign creators and backers (closed)
- [html-jukebox#1](https://github.com/toastmanAu/html-jukebox/issues/1) PROTOCOL_REPAIR: step 14 accepts a spliced append history (each backlink declares a prefix checksum) (closed)
- [ckbfs#3](https://github.com/code-tsao/ckbfs/issues/3) Measured v3 publish limits, prefix-checksum verification, and whether ckbfs:// is normative (closed)
- [Spool-Queue#1](https://github.com/pferreira-builds/Spool-Queue/issues/1) Optional JSON file persistence via File System Access API (closed)

</details>

All of it, as GitHub lists it: [pull requests and issues by LusoCryptoLabs](https://github.com/search?q=author%3ALusoCryptoLabs+-user%3ALusoCryptoLabs&type=issues).
