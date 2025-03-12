import { Component } from '@angular/core';
import { IonCheckbox } from '@ionic/angular/standalone';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],

})

export class AppComponent {
  toggle1: boolean = false;
  toggle2: boolean = false;
  toggle3: boolean = false;
  rangeValue: number = 0;
  checkbox1: boolean = false;
  checkbox2: boolean = false;
  checkbox3: boolean = false;
  radioOption1: boolean = false;
  radioOption2: boolean = false;

  async ngOnInit() {
    this.toggle1 = (await Preferences.get({ key: 'toggle1' })).value === 'true';
    this.toggle2 = (await Preferences.get({ key: 'toggle2' })).value === 'true';
    this.toggle3 = (await Preferences.get({ key: 'toggle3' })).value === 'true';
    this.rangeValue = parseInt((await Preferences.get({ key: 'rangeValue' })).value || '0');
    this.checkbox1 = (await Preferences.get({ key: 'checkbox1' })).value === 'true';
    this.checkbox2 = (await Preferences.get({ key: 'checkbox2' })).value === 'true';
    this.checkbox3 = (await Preferences.get({ key: 'checkbox3' })).value === 'true';
    this.radioOption1 = (await Preferences.get({ key: 'radioOption1' })).value === 'true';
    this.radioOption2 = (await Preferences.get({ key: 'radioOption2' })).value === 'true';
  }

  async saveToggle(key: string, event: any) {
    await Preferences.set({ key, value: event.detail.checked.toString() });
  }

  async saveRange(key: string, event: any) {
    await Preferences.set({ key, value: event.detail.value.toString() });
  }

  async saveCheckbox(key: string, event: any) {
    await Preferences.set({ key, value: event.detail.checked.toString() });
  
}

}
