import { Component, OnInit, ViewChild  } from '@angular/core';
import { timer, Subject } from 'rxjs';
import { map, takeUntil, takeWhile } from 'rxjs/operators';
import { Platform, NavController } from '@ionic/angular';
import { IonDatetime, IonDatetimeButton, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class  HomePage implements OnInit {
  public currentDate: Date;
  public chosenDate: Date;

  // Timer Variables
  remainingTime: number = 0;
  minutes: number = 25;
  seconds: number = 0;
  timer: any;
  timerRunning: boolean = false;

  constructor(public navCtrl: NavController, private platform: Platform) {
    this.currentDate = new Date();
    this.chosenDate = new Date(); // Initialize chosenDate as current date
  }

  ngOnInit() {
    // You can add any initialization logic here if needed
  }

  startTimer() {
    if (this.timerRunning) return;

    this.timerRunning = true;
    let totalSeconds = this.minutes * 60 + this.seconds;

    // Clear previous timer if it exists
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(() => {
      totalSeconds--;

      this.minutes = Math.floor(totalSeconds / 60);
      this.seconds = totalSeconds % 60;

      if (totalSeconds <= 0) {
        clearInterval(this.timer);
        this.timerRunning = false;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerRunning) {
      clearInterval(this.timer);
      this.timerRunning = false;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.minutes = 25;
    this.seconds = 0;
  }

  // Formatting the time to HH:mm:ss format
  getFormattedTime() {
    const hoursString = this.minutes < 10 ? '0' + Math.floor(this.minutes / 60) : Math.floor(this.minutes / 60);
    const minutesString = this.minutes < 10 ? '0' + (this.minutes % 60) : this.minutes % 60;
    const secondsString = this.seconds < 10 ? '0' + this.seconds : this.seconds;

    return `${hoursString}:${minutesString}:${secondsString}`;
  }
}