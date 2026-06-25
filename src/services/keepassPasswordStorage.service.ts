import { Injectable } from '@angular/core'
import { VaultService } from 'tabby-core'
import { PasswordStorageService } from 'tabby-ssh'
import { KeePassService } from './keepass.service'
import { KeePassAutoResponderService } from './keepassAutoResponder.service'

@Injectable()
export class KeePassPasswordStorageService extends PasswordStorageService {
    constructor (
        vault: VaultService,
        private keePass: KeePassService,
        private autoResponder: KeePassAutoResponderService,
    ) {
        super(vault)
    }

    async loadPassword (profile: any, username?: string): Promise<string | null> {
        const host: string | undefined = profile?.options?.host
        const port: number = profile?.options?.port ?? 22

        if (host) {
            try {
                const pw = await this.keePass.findPasswordForSSH(host, port)
                if (pw) {
                    // loadPassword is called before keyboard-interactive prompts fire,
                    // so this is the right moment to set up the TOTP interceptor.
                    this.autoResponder.ensureWatching()
                    return pw
                }
            } catch (e) {
                console.error('[KeePass] Error looking up SSH password:', e)
            }
        }

        return super.loadPassword(profile, username)
    }
}
