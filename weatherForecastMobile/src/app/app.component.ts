import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  // constructor() {}
  constructor() {
    this.loadTheme();
  }

  async loadTheme() {
    const { value } = await Preferences.get({ key: 'darkMode' });
    document.body.classList.toggle('dark', value === 'true');
  }
}
