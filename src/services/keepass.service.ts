import { Injectable } from '@angular/core'
import { ConfigService, SelectorService } from 'tabby-core'
import { KeychainService } from './keychain.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const kdbxweb = require('kdbxweb')

interface CachedDb {
    db: any
    expiresAt: number
}

type FsWatcher = ReturnType<typeof import('fs').watch>

// Wire hash-wasm's argon2 into kdbxweb's CryptoEngine so KDBX4 databases open.
function setupArgon2 (): void {
    try {
        // eslint-disable-next-line no-eval
        const { argon2d, argon2i, argon2id } = eval('require')('hash-wasm')
        const fns: ((o: any) => Promise<Uint8Array>)[] = [argon2d, argon2i, argon2id]

        kdbxweb.CryptoEngine.argon2 = async (
            password: ArrayBuffer, salt: ArrayBuffer,
            memory: number, iterations: number, length: number,
            parallelism: number, type: number,
        ): Promise<ArrayBuffer> => {
            const hash = await fns[type]({
                password: new Uint8Array(password),
                salt: new Uint8Array(salt),
                iterations,
                memorySize: memory,
                hashLength: length,
                parallelism,
                outputType: 'binary',
            })
            return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength) as ArrayBuffer
        }

        console.log('[KeePass] argon2 engine ready')
    } catch (e) {
        console.error('[KeePass] argon2 setup failed — KDBX4 databases will not open:', e)
    }
}

setupArgon2()

function base32Decode (s: string): Buffer {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const clean = s.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
    let bits = 0; let value = 0
    const out: number[] = []
    for (const ch of clean) {
        const idx = alpha.indexOf(ch)
        if (idx < 0) continue
        value = (value << 5) | idx
        bits += 5
        if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8 }
    }
    return Buffer.from(out)
}

function generateTOTP (base32Secret: string, digits = 6, period = 30): string {
    const crypto = require('crypto') as typeof import('crypto')
    const key = base32Decode(base32Secret)
    const counter = Math.floor(Date.now() / 1000 / period)
    const buf = Buffer.alloc(8)
    buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0)
    buf.writeUInt32BE(counter >>> 0, 4)
    const hash = crypto.createHmac('sha1', key).update(buf).digest()
    const offset = hash[hash.length - 1] & 0x0f
    const code = ((hash[offset] & 0x7f) << 24 | (hash[offset + 1] & 0xff) << 16 |
                  (hash[offset + 2] & 0xff) << 8  | (hash[offset + 3] & 0xff)) >>> 0
    return (code % (10 ** digits)).toString().padStart(digits, '0')
}

@Injectable({ providedIn: 'root' })
export class KeePassService {
    private cache: CachedDb | null = null
    private watcher: FsWatcher | null = null
    private watchedPath: string | null = null
    private entryCache = new Map<string, any>()

    constructor (
        private config: ConfigService,
        private keychain: KeychainService,
        private selector: SelectorService,
    ) {}

    async findPasswordForSSH (host: string, port: number): Promise<string | null> {
        const entry = await this.findEntry(host, port)
        if (!entry) return null
        const pw = entry.fields.get('Password')
        if (!pw) return null
        return typeof pw.getText === 'function' ? pw.getText() : String(pw)
    }

    async findTotpForSSH (host: string, port: number): Promise<string | null> {
        const entry = await this.findEntry(host, port)
        if (!entry) return null
        const seed = this.extractTotpSeed(entry)
        if (!seed) return null
        return generateTOTP(seed)
    }

    clearCache (): void {
        this.cache = null
        this.entryCache.clear()
    }

    private async findEntry (host: string, port: number): Promise<any> {
        const key = `${host}:${port}`
        if (this.entryCache.has(key)) return this.entryCache.get(key)

        const db = await this.openDb()
        if (!db) return null

        const candidates = new Set<string>([`ssh://${host}`, `ssh://${host}:${port}`])
        if (port === 22) candidates.add(`ssh://${host}:22`)

        const matches = this.collectAllEntries(db, candidates)
        if (matches.length === 0) return null

        let entry: any
        if (matches.length === 1) {
            entry = matches[0]
        } else {
            try {
                entry = await this.selector.show(
                    'KeePass — 항목 선택',
                    matches.map(e => ({
                        name: `${this.fieldStr(e, 'Title')} (${this.fieldStr(e, 'UserName')})`,
                        result: e,
                    })),
                )
            } catch {
                return null
            }
        }

        this.entryCache.set(key, entry)
        return entry
    }

    private fieldStr (entry: any, name: string): string {
        const f = entry.fields.get(name)
        if (!f) return ''
        return typeof f.getText === 'function' ? f.getText() : String(f)
    }

    private extractTotpSeed (entry: any): string | null {
        const fieldVal = (name: string): string | null => {
            const f = entry.fields.get(name)
            if (!f) return null
            return typeof f.getText === 'function' ? f.getText() : String(f)
        }

        // KeePassXC / standard: URI format otpauth://totp/...?secret=BASE32...
        const otp = fieldVal('otp')
        if (otp) {
            const m = otp.match(/[?&]secret=([A-Z2-7]+)/i)
            if (m) return m[1]
            if (/^[A-Z2-7]{16,}$/i.test(otp.trim())) return otp.trim()
        }

        // KeePass 2.47+ built-in TOTP
        const builtin = fieldVal('TimeOtp-Secret-Base32')
        if (builtin) return builtin.trim()

        // Legacy KeePass TOTP plugin
        const legacy = fieldVal('TOTP Seed')
        if (legacy) return legacy.trim()

        return null
    }

    private watchFile (kdbxPath: string): void {
        if (this.watchedPath === kdbxPath) return
        this.watcher?.close()
        this.watcher = null
        this.watchedPath = kdbxPath
        try {
            const fs = require('fs') as typeof import('fs')
            this.watcher = fs.watch(kdbxPath, { persistent: false }, () => {
                console.log('[KeePass] Database file changed, clearing cache')
                this.cache = null
            })
            this.watcher.on('error', () => {
                this.watcher = null
                this.watchedPath = null
            })
        } catch (e) {
            console.warn('[KeePass] Cannot watch database file:', e)
        }
    }

    private async openDb (): Promise<any> {
        const now = Date.now()

        if (this.cache && this.cache.expiresAt > now) return this.cache.db
        this.cache = null

        const kdbxPath: string = this.config.store.keepass?.kdbxPath
        if (!kdbxPath) return null
        this.watchFile(kdbxPath)

        const masterPassword = await this.keychain.getMasterPassword(kdbxPath)
        if (!masterPassword) {
            console.warn('[KeePass] Master password not found in keychain — open Settings → KeePass SSH to save it')
            return null
        }

        try {
            const fs = require('fs') as typeof import('fs')
            const buf: Buffer = fs.readFileSync(kdbxPath)
            // buf.buffer may be a shared backing store; slice to get an exact copy
            const ab = buf.buffer.slice(
                buf.byteOffset,
                buf.byteOffset + buf.byteLength,
            ) as ArrayBuffer

            const credentials = new kdbxweb.Credentials(
                kdbxweb.ProtectedValue.fromString(masterPassword),
            )
            const db = await kdbxweb.Kdbx.load(ab, credentials)

            const ttlMinutes: number = this.config.store.keepass?.cacheTTLMinutes ?? 10
            this.cache = { db, expiresAt: now + ttlMinutes * 60 * 1000 }
            return db
        } catch (e) {
            console.error('[KeePass] Failed to open database:', e)
            return null
        }
    }

    private collectAllEntries (db: any, urlCandidates: Set<string>): any[] {
        const results: any[] = []
        for (const group of db.groups) {
            this.collectGroup(group, urlCandidates, results)
        }
        return results
    }

    private collectGroup (group: any, urlCandidates: Set<string>, results: any[]): void {
        for (const entry of group.entries ?? []) {
            const url: string = entry.fields.get('URL') ?? ''
            if (urlCandidates.has(url.replace(/\/$/, ''))) results.push(entry)
        }
        for (const child of group.groups ?? []) {
            this.collectGroup(child, urlCandidates, results)
        }
    }
}
