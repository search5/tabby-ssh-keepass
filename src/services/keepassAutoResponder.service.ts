import { Injectable } from '@angular/core'
import { AppService } from 'tabby-core'
import { KeePassService } from './keepass.service'

@Injectable({ providedIn: 'root' })
export class KeePassAutoResponderService {
    private watchedTabs = new WeakSet<object>()

    constructor (private app: AppService, private keePass: KeePassService) {}

    // Called from loadPassword — guaranteed to run before keyboard-interactive prompts
    ensureWatching (): void {
        for (const topTab of this.app.tabs) {
            const allTabs: any[] = typeof (topTab as any).getAllTabs === 'function'
                ? (topTab as any).getAllTabs()
                : [topTab]
            for (const t of allTabs) {
                if ('sshSession' in t) {
                    this.watchTab(t)
                }
            }
        }
    }

    private watchTab (tab: any) {
        if (this.watchedTabs.has(tab)) return
        this.watchedTabs.add(tab)

        let kiValue: any = tab.activeKIPrompt ?? null
        try {
            Object.defineProperty(tab, 'activeKIPrompt', {
                configurable: true,
                enumerable: true,
                get: () => kiValue,
                set: (v: any) => {
                    kiValue = v
                    if (v) {
                        const host: string | undefined = tab.profile?.options?.host
                        const port: number = tab.profile?.options?.port ?? 22
                        if (host) {
                            void this.handleKIPrompt(v, host, port)
                        }
                    }
                },
            })
        } catch (e) {
            console.warn('[KeePass] Could not intercept activeKIPrompt:', e)
        }
    }

    private async handleKIPrompt (prompt: any, host: string, port: number): Promise<void> {
        for (let i = 0; i < prompt.prompts.length; i++) {
            if (prompt.responses[i]) continue
            const text: string = prompt.prompts[i]?.prompt ?? ''
            if (this.isTotpPrompt(text)) {
                const code = await this.keePass.findTotpForSSH(host, port)
                if (code) {
                    prompt.responses[i] = code
                }
            }
        }

        if (prompt.responses.length > 0 && prompt.responses.every((r: string) => r)) {
            setTimeout(() => prompt.respond(), 0)
        }
    }

    private isTotpPrompt (text: string): boolean {
        return /verif|authenticat|totp|otp\b|2fa\b|mfa\b|one.time|time.based/i.test(text)
    }
}
