import { Injectable } from '@angular/core'
import { SettingsTabProvider } from 'tabby-settings'
import { KeePassSettingsTabComponent } from './components/keepassSettingsTab.component'

@Injectable()
export class KeePassSettingsTabProvider extends SettingsTabProvider {
    id = 'keepass'
    icon = 'key'
    title = 'KeePass SSH'
    weight = 10

    getComponentType (): any {
        return KeePassSettingsTabComponent
    }
}
