import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const args = {
    manifest: 'manifest.json',
    out: 'updates.json',
    tag: undefined,
    updateLink: undefined,
    updateHash: undefined,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    const next = argv[i + 1]
    if (a === '--manifest') {
      args.manifest = next
      i++
    }
    else if (a === '--out') {
      args.out = next
      i++
    }
    else if (a === '--tag') {
      args.tag = next
      i++
    }
    else if (a === '--update-link') {
      args.updateLink = next
      i++
    }
    else if (a === '--update-hash') {
      args.updateHash = next
      i++
    }
    else {
      throw new Error(`Unknown arg: ${a}`)
    }
  }

  return args
}

const args = parseArgs(process.argv)
if (!args.updateLink) {
  throw new Error('Missing required arg: --update-link')
}

const manifestPath = path.resolve(args.manifest)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const zoteroApp = manifest?.applications?.zotero
const addonId = zoteroApp?.id
const strictMinVersion = zoteroApp?.strict_min_version
const strictMaxVersion = zoteroApp?.strict_max_version
const version = manifest?.version

if (!addonId)
  throw new Error('manifest.json missing applications.zotero.id')
if (!version)
  throw new Error('manifest.json missing version')
if (!strictMinVersion || !strictMaxVersion)
  throw new Error('manifest.json missing applications.zotero strict_min_version/strict_max_version')

const update = {
  version,
  update_link: args.updateLink,
  ...(args.updateHash ? { update_hash: args.updateHash } : {}),
  applications: {
    zotero: {
      strict_min_version: strictMinVersion,
      strict_max_version: strictMaxVersion,
    },
  },
}

const updatesManifest = {
  addons: {
    [addonId]: {
      updates: [update],
    },
  },
}

fs.writeFileSync(path.resolve(args.out), `${JSON.stringify(updatesManifest, null, 2)}\n`)
if (args.tag) {
  // Lightweight breadcrumb for CI logs.
  // eslint-disable-next-line no-console
  console.log(`updates.json written for tag ${args.tag} (${addonId} -> ${version})`)
}
