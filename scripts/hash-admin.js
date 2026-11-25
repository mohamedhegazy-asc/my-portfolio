#!/usr/bin/env node
/**
 * scripts/hash-admin.js
 * Usage:
 *   node scripts/hash-admin.js          (hashes normalized phone credential)
 *   node scripts/hash-admin.js --raw    (hashes an extra passphrase without phone normalization)
 *
 * Reads the secret from stdin without echoing it or accepting it via argv.
 */
import { Writable } from 'node:stream'
import { createInterface } from 'node:readline'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const bcrypt = require('../ApplicationStructure2026/node_modules/bcryptjs')

const isRawMode = process.argv.includes('--raw')

const normalizePhone = (val = '') => {
    let digits = String(val).replace(/\D/g, '')
    if (digits.startsWith('0020')) {
        digits = digits.slice(4)
    } else if (digits.startsWith('20') && digits.length >= 12) {
        digits = digits.slice(2)
    }
    if (digits.length === 10 && digits.startsWith('1')) {
        digits = '0' + digits
    }
    return digits
}

const mutedStdout = new Writable({
    write(_chunk, _encoding, callback) {
        callback()
    }
})

const promptText = isRawMode
    ? 'Enter extra secret passphrase (input hidden): '
    : 'Enter admin phone number (input hidden): '

process.stderr.write(promptText)

const rl = createInterface({
    input: process.stdin,
    output: process.stdin.isTTY ? mutedStdout : undefined,
    terminal: Boolean(process.stdin.isTTY)
})

rl.question('', async (answer) => {
    rl.close()
    if (process.stdin.isTTY) {
        process.stderr.write('\n')
    }

    const trimmed = String(answer || '').trim()
    if (!trimmed) {
        process.stderr.write('Error: no input provided.\n')
        process.exit(1)
    }

    const valueToHash = isRawMode ? trimmed : normalizePhone(trimmed)
    const hash = await bcrypt.hash(valueToHash, 12)

    const varName = isRawMode ? 'ADMIN_EXTRA_SECRET_HASH' : 'ADMIN_CREDENTIAL_HASH'
    process.stdout.write(`\n${varName}=${hash}\n`)
    process.stderr.write(`Paste ${varName} into your Vercel Environment Variables (and local .env.development for local testing).\n`)
})
