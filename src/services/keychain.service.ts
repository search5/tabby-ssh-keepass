import { Injectable } from '@angular/core'

// keytar is bundled with Tabby (used for SSH key passphrase storage)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const keytar = require('keytar')

const SERVICE_NAME = 'tabby-keepass-ssh'

@Injectable({ providedIn: 'root' })
export class KeychainService {
    async getMasterPassword (kdbxPath: string): Promise<string | null> {
        try {
            return await keytar.getPassword(SERVICE_NAME, kdbxPath)
        } catch (e) {
            console.error('[KeePass] keytar.getPassword failed:', e)
            return null
        }
    }

    async setMasterPassword (kdbxPath: string, password: string): Promise<void> {
        await keytar.setPassword(SERVICE_NAME, kdbxPath, password)
    }

    async deleteMasterPassword (kdbxPath: string): Promise<boolean> {
        try {
            return await keytar.deletePassword(SERVICE_NAME, kdbxPath)
        } catch (e) {
            console.error('[KeePass] keytar.deletePassword failed:', e)
            return false
        }
    }

    async hasPassword (kdbxPath: string): Promise<boolean> {
        const pw = await this.getMasterPassword(kdbxPath)
        return pw !== null
    }
}
