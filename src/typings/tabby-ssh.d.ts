declare module 'tabby-ssh' {
    import { VaultService } from 'tabby-core'

    class PasswordStorageService {
        constructor(vault: VaultService)
        loadPassword(profile: any, username?: string): Promise<string | null>
        savePassword(profile: any, password: string, username?: string): Promise<void>
        deletePassword(profile: any, username?: string): Promise<void>
    }

    const _default: any
    export default _default
    export { PasswordStorageService }
}
