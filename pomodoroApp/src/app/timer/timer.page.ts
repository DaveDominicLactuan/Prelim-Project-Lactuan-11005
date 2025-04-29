import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrl: './timer.page.scss',
  standalone: false
})
export class TimerPage implements OnInit {
  workDuration = 1500; // 25 minutes
  // workDuration = 10; // 25 minutes
  breakDuration = 300; // 5 minutes
  // breakDuration = 10; // 5 minutes
  totalSeconds = this.workDuration;
  remainingSeconds = this.totalSeconds;
  isRunning = false;
  isWorkPhase = true;
  displayTime = '';
  intervalId: any;
  permissionStatus: string = '';
  count: number = 1;

  async ngOnInit() {
    this.updateDisplayTime();
    this.setProgress();
    this.requestPermission2();  }

    startTimer() {
      if (this.isRunning) return;
      this.isRunning = true;
    
      // If starting fresh (after everything finished), ensure correct phase
      if (!this.isWorkPhase) {
        this.isWorkPhase = true;
        this.totalSeconds = this.workDuration;
        this.remainingSeconds = this.totalSeconds;
        this.setProgress();
        this.updateDisplayTime();
      }
    
      this.runCountdown();
    }
    
    runCountdown() {
      this.intervalId = setInterval(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.updateDisplayTime();
          this.setProgress();
        } else {
          clearInterval(this.intervalId);
          
    
          if (this.isWorkPhase) {
            // Work session complete
            // this.sendNotification2();
            // Switch to break phase
            this.sendNotification2();
            this.isWorkPhase = false;
            this.totalSeconds = this.breakDuration;
            this.remainingSeconds = this.totalSeconds;
            this.setProgress();
            this.updateDisplayTime();
            
    
            // Start break timer automatically
            setTimeout(() => {
              this.runCountdown();
            }, 1000);
          } else {
            // Break session complete
            this.sendNotification3();
           
            this.isRunning = false;
            this.isWorkPhase = true; // Reset to work phase for next manual start
            this.totalSeconds = this.workDuration;
            this.remainingSeconds = this.totalSeconds;
            this.updateDisplayTime();
            this.setProgress();
            this.sendNotification3();
            this.count = 1;
            // Now user needs to click Start manually again
          }
        }
      }, 1000);
    }

  updateDisplayTime() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    this.displayTime = `${this.pad(mins)}:${this.pad(secs)}`;
  }

  pad(val: number): string {
    return val < 10 ? '0' + val : val.toString();
  }

  resetTimer() {
    clearInterval(this.intervalId);
    
    this.isRunning = false;
    this.isWorkPhase = true;
    this.totalSeconds = this.workDuration;
    this.remainingSeconds = this.totalSeconds;
    this.updateDisplayTime();
    this.setProgress();
  }

  setProgress() {
    const circle = document.querySelector('.progress-ring__circle') as SVGCircleElement;
    if (!circle) return; // Safety check
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (this.remainingSeconds / this.totalSeconds) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${offset}`;
    circle.style.stroke = this.isWorkPhase ? 'blue' : 'green';
  }

  async sendNotification(title: string, body: string) {
  await LocalNotifications.schedule({
    notifications: [
      {
        title,
        body,
        id: Date.now(), // unique id
        schedule: { at: new Date(Date.now() + 1000) }, // 1 sec after
        sound: undefined,
        smallIcon: "ic_stat_icon_config_sample", // optional
        actionTypeId: "",
        attachments: undefined,
        extra: null,
      },
    ],
  });
}


async requestPermission() {
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display === 'granted') {
    console.log('Notification permission granted');
  } else {
    console.log('Notification permission denied');
  }

}

async sendNotification2() {
    if (this.permissionStatus !== 'Granted') {
      alert('Permission not granted!');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Greeting User!',
          body: 'Its time for break time.',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
          sound: 'dings.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  async sendNotification3() {
    if (this.permissionStatus !== 'Granted') {
      alert('Permission not granted!');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Greeting User!',
          body: 'The break has ended, would you like to try again.',
          id: 1,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second later
          sound: 'dings.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }
  

  async requestPermission2() {
    const permission = await LocalNotifications.requestPermissions();
    this.permissionStatus = permission.display === 'granted' ? 'Granted' : 'Denied';
  }

}