import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  toggleOptions: boolean[] = [false, false, false];
  rangeValue: number = 50;
  checkboxes: boolean[] = [false, false, false, false, false];

  async ngOnInit() {
    await this.loadPreferences();
  }

  async loadPreferences() {
    const toggleData = await Preferences.get({ key: 'toggleOptions' });
    if (toggleData.value) this.toggleOptions = JSON.parse(toggleData.value);

    const rangeData = await Preferences.get({ key: 'rangeValue' });
    if (rangeData.value) this.rangeValue = JSON.parse(rangeData.value);

    const checkboxData = await Preferences.get({ key: 'checkboxes' });
    if (checkboxData.value) this.checkboxes = JSON.parse(checkboxData.value);
  }

  async savePreferences() {
    await Preferences.set({ key: 'toggleOptions', value: JSON.stringify(this.toggleOptions) });
    await Preferences.set({ key: 'rangeValue', value: JSON.stringify(this.rangeValue) });
    await Preferences.set({ key: 'checkboxes', value: JSON.stringify(this.checkboxes) });
  }

  async resetPreferences() {
    this.toggleOptions = [false, false, false];
    this.rangeValue = 50;
    this.checkboxes = [false, false, false, false, false];
    await this.savePreferences();
  }
}
