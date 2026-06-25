import { ConfigProvider } from 'tabby-core'

export class KeePassConfigProvider extends ConfigProvider {
    defaults = {
        keepass: {
            kdbxPath: null as string | null,
            cacheTTLMinutes: 5,
            autoSelectSingleMatch: false,
        },
    }

    platformDefaults = {}
}
