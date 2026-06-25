import { Injectable } from '@angular/core'
import { AppService } from 'tabby-core'
import { KeePassService } from './keepass.service'

@Injectable({ providedIn: 'root' })
export class KeePassAutoResponderService {
    private subscribedSessions = new WeakSet<object>()

    constructor (private app: AppService, private keePass: KeePassService) {
        this.app.tabOpened$.subscribe(tab => this.onTab(tab))
        for (const tab of this.app.tabs) {
            this.onTab(tab)
        }
    }

    private onTab (tab: any) {
        const innerTabs: any[] = typeof tab.getAllTabs === 'function' ? tab.getAllTabs() : [tab]
        for (const t of innerTabs) {
            if ('sshSession' in t) {
                this.watchTab(t)
            }
        }
    }

    private watchTab (tab: any) {
        if (tab.sshSession) {
            this.subscribeSession(tab.sshSession)
        }
    }

    subscribeForProfile (profile: any): void {
        for (const topTab of this.app.tabs) {
            const allTabs: any[] = typeof (topTab as any).getAllTabs === 'function'
                ? (topTab as any).getAllTabs()
                : [topTab]
            for (const t of allTabs) {
                if (t.sshSession && t.profile?.id === profile.id) {
                    this.subscribeSession(t.sshSession)
                    return
                }
            }
        }
    }

    scheduleKIDisplay (host: string, port: number): void {
        // loadPassword is called from keyboardInteractiveAuthPanel.ngOnInit —
        // setTimeout(0) fires after Angular finishes rendering the panel's children
        setTimeout(() => void this.injectTotpDisplay(host, port), 0)
    }

    private subscribeSession (session: any) {
        if (this.subscribedSessions.has(session)) return
        this.subscribedSessions.add(session)

        const sub = session.keyboardInteractivePrompt$.subscribe((prompt: any) => {
            void this.handlePrompt(session, prompt)
        })
        session.willDestroy$.subscribe(() => sub.unsubscribe())
    }

    private async handlePrompt (session: any, prompt: any): Promise<void> {
        const host: string | undefined = session.profile?.options?.host
        const port: number = session.profile?.options?.port ?? 22
        if (!host) return

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
        return /verif|authenticat|otp\b|2fa\b|mfa\b|one.time|time.based/i.test(text)
    }

    private async injectTotpDisplay (host: string, port: number): Promise<void> {
        const panel = document.querySelector('keyboard-interactive-auth-panel')
        if (!panel) return

        const promptText = (panel.querySelector('.prompt-text')?.textContent ?? '').trim()
        const isTotp = this.isTotpPrompt(promptText)
        const isPassword = !isTotp && promptText.toLowerCase().includes('password')

        if (!isTotp && !isPassword) return

        if (isPassword) {
            // Password already pre-filled by Angular — just auto-submit
            setTimeout(() => {
                const btn = panel.querySelector('button.btn-primary') as HTMLButtonElement | null
                btn?.click()
            }, 100)
            return
        }

        const code = await this.keePass.findTotpForSSH(host, port)
        if (!code) return

        // Auto-fill the input
        const input = panel.querySelector('input.form-control') as HTMLInputElement | null
        if (input) {
            input.value = code
            input.dispatchEvent(new Event('input'))
        }

        // Auto-submit
        setTimeout(() => {
            const btn = panel.querySelector('button.btn-primary') as HTMLButtonElement | null
            btn?.click()
        }, 100)
    }
}
