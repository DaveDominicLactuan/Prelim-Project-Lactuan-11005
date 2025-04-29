import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  permissionStatus: string = '';

  constructor() {}

  async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    this.permissionStatus = permission.display === 'granted' ? 'Granted' : 'Denied';
  }

  async sendNotification() {
    if (this.permissionStatus !== 'Granted') {
      alert('Permission not granted!');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Hello!',
          body: 'This is a local notification.',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }
}
