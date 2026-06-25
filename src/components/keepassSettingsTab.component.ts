import { Component, HostBinding, OnInit } from '@angular/core'
import { ConfigService } from 'tabby-core'
import { KeychainService } from '../services/keychain.service'

@Component({
    selector: 'keepass-settings-tab',
    template: require('./keepassSettingsTab.component.html').default,
})
export class KeePassSettingsTabComponent implements OnInit {
    @HostBinding('class.content-box') contentBox = true

    masterPasswordInput = ''
    passwordSavedInKeychain = false
    keychainLoading = false
    saveSuccess = false

    private saveSuccessTimer: ReturnType<typeof setTimeout> | null = null

    constructor (
        public config: ConfigService,
        private keychain: KeychainService,
    ) {}

    async ngOnInit (): Promise<void> {
        await this.refreshKeychainStatus()
    }

    async onPathChanged (newPath: string): Promise<void> {
        this.config.save()
        this.masterPasswordInput = ''
        this.passwordSavedInKeychain = false
        await this.refreshKeychainStatus()
    }

    async saveMasterPassword (): Promise<void> {
        const path = this.config.store.keepass.kdbxPath
        if (!path || !this.masterPasswordInput) return

        await this.keychain.setMasterPassword(path, this.masterPasswordInput)
        this.masterPasswordInput = ''
        this.passwordSavedInKeychain = true
        this.showSaveSuccess()
    }

    async removeMasterPassword (): Promise<void> {
        const path = this.config.store.keepass.kdbxPath
        if (!path) return

        await this.keychain.deleteMasterPassword(path)
        this.passwordSavedInKeychain = false
    }

    async browsePath (): Promise<void> {
        try {
            // Electron dialog API — available in Tabby's nodeIntegration renderer
            const { dialog } = require('electron').remote ?? require('@electron/remote')
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: 'KeePass Database', extensions: ['kdbx'] }],
            })
            if (!result.canceled && result.filePaths.length > 0) {
                this.config.store.keepass.kdbxPath = result.filePaths[0]
                await this.onPathChanged(result.filePaths[0])
            }
        } catch {
            // Electron remote not available — user must type path manually
            console.warn('[KeePass] File dialog unavailable; type path manually')
        }
    }

    private async refreshKeychainStatus (): Promise<void> {
        const path = this.config.store.keepass.kdbxPath
        if (!path) {
            this.passwordSavedInKeychain = false
            return
        }
        this.keychainLoading = true
        this.passwordSavedInKeychain = await this.keychain.hasPassword(path)
        this.keychainLoading = false
    }

    private showSaveSuccess (): void {
        this.saveSuccess = true
        if (this.saveSuccessTimer) clearTimeout(this.saveSuccessTimer)
        this.saveSuccessTimer = setTimeout(() => {
            this.saveSuccess = false
            this.saveSuccessTimer = null
        }, 2500)
    }
}
