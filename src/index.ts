import { NgModule, APP_INITIALIZER } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import TabbyCoreModule, { ConfigProvider } from 'tabby-core'
import { SettingsTabProvider } from 'tabby-settings'
import { PasswordStorageService } from 'tabby-ssh'

import { KeePassConfigProvider } from './config'
import { KeePassSettingsTabProvider } from './settings'
import { KeePassSettingsTabComponent } from './components/keepassSettingsTab.component'
import { KeePassPasswordStorageService } from './services/keepassPasswordStorage.service'
import { KeePassAutoResponderService } from './services/keepassAutoResponder.service'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TabbyCoreModule,
    ],
    providers: [
        { provide: ConfigProvider, useClass: KeePassConfigProvider, multi: true },
        { provide: SettingsTabProvider, useClass: KeePassSettingsTabProvider, multi: true },
        { provide: PasswordStorageService, useClass: KeePassPasswordStorageService },
        {
            provide: APP_INITIALIZER,
            useFactory: (s: KeePassAutoResponderService) => () => {},
            deps: [KeePassAutoResponderService],
            multi: true,
        },
    ],
    declarations: [
        KeePassSettingsTabComponent,
    ],
})
export default class KeePassSSHModule {}
