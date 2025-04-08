import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { WeatherService } from '../weather.service';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  darkMode: boolean = false;
  isDarkMode: boolean = false;
  value1: string = "Hello World";
  value2: string = "Good Noon"
  locationData: any;
  // cityName: string = ""; 
  searchResults: any[] = [];
  locationDataLocationKey: string | null = null;
  weatherData: any; // ✅ Store full weather data object
  suggestion: any[] = [];
  //windSpeed: number | null = null; // To store the wind speed
  locationKey = 'YOUR_LOCATION_KEY'; // Replace with a valid location key
  isToggled: boolean = false;
  message: string ="Hi";
  minTemp: number | any | null = null; // Minimum temperature
  maxTemp: number | any |null = null; // Maximum temperature
  FminTemp: number | any | null = null; // Minimum temperature
  FmaxTemp: number | any |null = null; // Maximum temperature
  CminTemp: number | any | null = null; // Minimum temperature
  CmaxTemp: number | any |null = null; // Maximum temperature
  tempUnit: string = ''; // "C" or "F"
  Light: string = "Light";
  Dark: string = "Dark";
 
  humidity2: any;

  windUnit: string = '';
  @ViewChild('container1', { static: false }) container1!: ElementRef;
  @ViewChild('container2', { static: false }) container2!: ElementRef;
  divCount = 0; // Keep track of the number of divs
  conditionData: any;
  Faren: string = "Farenheit";
  Cel: string = "celcius";
  tempValue: boolean = false;
  iconValue: number | any;


  cityName: string = ""; 
  temperatureC: number | null = null;
  temperatureF: number | null = null;
  minTempC: number | null = null;
  maxTempC: number | null = null;
  minTempF: number | any | null = null;
  maxTempF: number | any | null = null;
  humidity: number | null = null;
  windSpeed: number | null = null;

  latitude: number | null = null;
  longitude: number | null = null;
  locationKeyInformation: string = '';
  isLoading = false;
  errorMessage = '';

  savedWeatherData: {
    temperatureC?: number | null;
    temperatureF?: number | null;
    minTempC?: number;
    maxTempC?: number;
    minTempF?: number;
    maxTempF?: number;
    windSpeed?: number | null;
    humidity?: number | null;
  } = {};



  

  constructor(private router: Router, private weatherService: WeatherService, private renderer: Renderer2) {}

  // ngOnInit() {
  //   this.getWeather(); // Automatically run on app load
  // }

  async ngOnInit() {


    this.loadSavedWeather();

    if (!navigator.onLine) {
      const cachedData = await this.loadWeatherData();
      if (cachedData) {
        this.temperatureC = cachedData.temperatureC;
        this.temperatureF = cachedData.temperatureF;
        this.windSpeed = cachedData.windSpeed;
        this.humidity = cachedData.humidity;
        this.minTempC = cachedData.minTempC;
        this.maxTempC = cachedData.maxTempC;
        this.minTempF = cachedData.minTempF;
        this.maxTempF = cachedData.maxTempF;
        console.log('Loaded weather from cache:', cachedData);
      } else {
        this.errorMessage = 'No cached weather data available.';
      }
    }
    
  
              
    const cachedFiveDay = await this.loadFiveDayForecast();
    const cachedTwelveHour = await this.loadTwelveHourForecast();
   
  
    if (cachedFiveDay) {
      this.renderFiveDayForecast(cachedFiveDay); // <- you need to extract your rendering logic to a method
    }
  
    if (cachedTwelveHour) {
      this.renderTwelveHourForecast(cachedTwelveHour); // <- same here
    }

  
    this.getWeather(); // Automatically run on app load
  
  }

  async getWeather() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      });

      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      console.log(`Coordinates: ${this.latitude}, ${this.longitude}`);

      this.weatherService.getLocationByCoordinates(this.latitude, this.longitude).subscribe({
        next: (data) => {
          this.cityName = data.LocalizedName;
          this.locationKeyInformation = data.Key;
          console.log('City Name:', this.cityName, 'Location Key:', this.locationKeyInformation);
          this.fetchWeatherData(this.locationKeyInformation);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to get city name from coordinates.';
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error(error);
      this.errorMessage = 'Unable to fetch geolocation.';
      this.isLoading = false;
    }
  }

  fetchWeatherData(locationKey: string) {
    this.weatherService.getCurrentConditions(locationKey).subscribe({
      next: (weatherRes) => {
        const weather = weatherRes[0];
        if (weather) {
          this.temperatureC = weather.Temperature.Metric.Value;
          this.temperatureF = weather.Temperature.Imperial.Value;
          this.humidity = weather.RelativeHumidity;
          this.windSpeed = weather.Wind.Speed.Metric.Value;
  
          this.savedWeatherData.temperatureC = this.temperatureC;
          this.savedWeatherData.temperatureF = this.temperatureF;
          this.savedWeatherData.windSpeed = this.windSpeed;
          this.savedWeatherData.humidity = this.humidity;
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch current conditions.';
      }
    });
  
    this.weatherService.getWeatherForecast(locationKey).subscribe({
      next: async (forecastRes) => {
        const daily = forecastRes.DailyForecasts?.[0];
        if (daily) {
          this.minTempF = daily.Temperature.Minimum.Value;
          this.maxTempF = daily.Temperature.Maximum.Value;
          this.minTempC = this.convertToCelsius(this.minTempF);
          this.maxTempC = this.convertToCelsius(this.maxTempF);
  
          this.savedWeatherData.minTempC = this.minTempC;
          this.savedWeatherData.maxTempC = this.maxTempC;
          this.savedWeatherData.minTempF = this.minTempF;
          this.savedWeatherData.maxTempF = this.maxTempF;
  
          // ✅ Save all weather data after everything is available
          await this.saveWeatherData(this.savedWeatherData);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch forecast.';
        this.isLoading = false;
      }
    });

    

    this.weatherService.getWeatherForecastFiveDays(locationKey).subscribe(
      // (data: any) => {
      //   console.log('5-Day Forecast:', data);

      async (data: any) => {
        console.log('5-Day Forecast:', data);
        await this.saveFiveDayForecast(data);
        

        this.renderFiveDayForecast(data);

        
      },
      (error) => console.error('Error fetching 5-day forecast:', error)
    );

    this.weatherService.getWeatherForecast12Hour(locationKey).subscribe(
      // (hourlyData: any) => {
      //   console.log('12-Hour Forecast inside div:', hourlyData);

      async (hourlyData: any) => {
        console.log('12-Hour Forecast inside div:', hourlyData);
        await this.saveTwelveHourForecast(hourlyData); 

        this.renderTwelveHourForecast(hourlyData);
       
      },
      (error) => console.error('Error fetching 12-hour forecast:', error)
    );

    async (weatherData: any) => {
      await this.saveWeatherData(this.weatherData);
    }

    
  }

  convertToCelsius(fahrenheit: number): number {
    return Math.round((fahrenheit - 32) * 5 / 9);
  }

  

  async toggleDarkMode(event: any) {
    this.darkMode = event.detail.checked;
    document.body.classList.toggle('dark', this.darkMode);
    await Preferences.set({ key: 'darkMode', value: String(this.darkMode) });
  }

  async toggleTemperature(event: any) {
    this.tempValue = event.detail.checked;
    document.body.classList.toggle('celcius', this.tempValue);
    await Preferences.set({ key: 'tempValue', value: String(this.tempValue) });
  }

  

  async toggleTheme(event: any) {
    this.isDarkMode = event.detail.checked;
    // document.body.classList.toggle('dark', this.isDarkMode);
    console.log('Theme changed:', this.isDarkMode ? 'Dark' : 'Light'); // Debugging
    // await Preferences.set({ key: 'theme', value: this.isDarkMode ? 'dark' : 'light' });
  }

  navigateToSecondPage() {
    this.router.navigate(['/search-city-weather']);
  }

  searchCity(cityName: string) {
    if (!cityName.trim()) return;

    this.isLoading = true;
    this.weatherService.getLocationKey(cityName).subscribe(
      data => {
        if (data.length > 0) {
          this.locationDataLocationKey = data[0].Key;
          console.log('Location Key:', this.locationDataLocationKey);
        } else {
          console.warn('No matching city found.');
        }

        this.searchResults = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching city data', error);
        this.isLoading = false;
      }
    );
  }


  // Save 5-day forecast
  async saveFiveDayForecast(data: any) {
    await Preferences.set({
      key: 'fiveDayForecast',
      value: JSON.stringify(data),
    });
  }
  
  // Load 5-day forecast
  async loadFiveDayForecast(): Promise<any | null> {
    const { value } = await Preferences.get({ key: 'fiveDayForecast' });
    return value ? JSON.parse(value) : null;
  }
  
  // Save 12-hour forecast
  async saveTwelveHourForecast(data: any) {
    await Preferences.set({
      key: 'twelveHourForecast',
      value: JSON.stringify(data),
    });
  }
  
  // Load 12-hour forecast
  async loadTwelveHourForecast(): Promise<any | null> {
    const { value } = await Preferences.get({ key: 'twelveHourForecast' });
    return value ? JSON.parse(value) : null;
  }

  async saveWeatherData(data: any) {
    await Preferences.set({
      key: 'weatherData',
      value: JSON.stringify(data)
    });
  }
  
  

  async loadWeatherData(): Promise<any | null> {
    const { value } = await Preferences.get({ key: 'weatherData' });
    return value ? JSON.parse(value) : null;
  }

  

  renderFiveDayForecast(data: any) {
    if (data && data.DailyForecasts) {
      data.DailyForecasts.forEach((day: any, index: number) => {
        const date = new Date(day.Date).toDateString(); // Format date
        
        const images = [ 
          'weather1.png', 'weather2.png', 'weather3.png', 'weather4.png', 'weather5.png',
          'weather6.png', 'weather7.png', 'weather8.png', 'weather9.png', 'weather10.png',
          'weather11.png', 'weather12.png', 'weather13.png', 'weather14.png', 'weather15.png',
          'weather16.png', 'weather17.png', 'weather18.png', 'weather19.png', 'weather20.png',
          'weather21.png', 'weather22.png', 'weather23.png', 'weather24.png', 'weather25.png',
          'weather26.png', 'weather27.png', 'weather28.png', 'weather29.png', 'weather30.png',
          'weather31.png', 'weather32.png', 'weather33.png', 'weather34.png', 'weather35.png',
          'weather36.png', 'weather37.png', 'weather38.png', 'weather39.png', 'weather40.png',
          'weather41.png', 'weather42.png', 'weather43.png', 'weather44.png', 'weather45.png'
        ];
  
        let iconValue = day.Day.Icon; // Get the weather icon number
        console.log('Value of Icon:', iconValue);
        console.log('Icon Description:', day.Day.IconPhrase);
  
        // Ensure iconValue is within range (1-45)
        let imageSrc = 'assets/images/default.png'; // Fallback image
        if (iconValue >= 1 && iconValue <= images.length) {
          imageSrc = `assets/images/${images[iconValue - 1]}`;
        }
  
        // Create an image element
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Weather Image ${iconValue}`;  // Descriptive alt text
        img.style.width = '100%';
        img.style.height = '80%';
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center';
  
        const minTemp = `${day.Temperature.Minimum.Value}°${day.Temperature.Minimum.Unit}`;
        const maxTemp = `${day.Temperature.Maximum.Value}°${day.Temperature.Maximum.Unit}`;
  
        // Create a div for each day's forecast
        const newDiv = this.renderer.createElement('div');
        this.renderer.setProperty(newDiv, 'innerHTML', `Day ${index + 1} (${date}):<br>Min: ${minTemp} | Max: ${maxTemp}`);
  
        // Style the div
        this.renderer.setStyle(newDiv, 'height', '120px'); // Increased height to accommodate image
        this.renderer.setStyle(newDiv, 'padding', '10px');
        this.renderer.setStyle(newDiv, 'backgroundColor', ' rgb(16, 2, 206)');
        this.renderer.setStyle(newDiv, 'marginBottom', '5px');
        this.renderer.setStyle(newDiv, 'marginTop', '5px');
        this.renderer.setStyle(newDiv, 'borderRadius', '8px');
        this.renderer.setStyle(newDiv, 'textAlign', 'center');
        this.renderer.setStyle(newDiv, 'fontWeight', 'bold');
  
        // Append image to the div
        newDiv.appendChild(img);
  
        // Append the div to the container
        this.renderer.appendChild(this.container2.nativeElement, newDiv);
      });
    } else {
      console.error('Invalid 5-day forecast data format');
      
    }
  
    this.adjustContainerHeight();
  }
  
  
  renderTwelveHourForecast(hourlyData: any) {
    // Check if hourlyData is valid
    if (hourlyData && Array.isArray(hourlyData)) {
      // Define weather images based on Icon values (1-45)
      const images = [ 
        'weather1.png', 'weather2.png', 'weather3.png', 'weather4.png', 'weather5.png',
        'weather6.png', 'weather7.png', 'weather8.png', 'weather9.png', 'weather10.png',
        'weather11.png', 'weather12.png', 'weather13.png', 'weather14.png', 'weather15.png',
        'weather16.png', 'weather17.png', 'weather18.png', 'weather19.png', 'weather20.png',
        'weather21.png', 'weather22.png', 'weather23.png', 'weather24.png', 'weather25.png',
        'weather26.png', 'weather27.png', 'weather28.png', 'weather29.png', 'weather30.png',
        'weather31.png', 'weather32.png', 'weather33.png', 'weather34.png', 'weather35.png',
        'weather36.png', 'weather37.png', 'weather38.png', 'weather39.png', 'weather40.png',
        'weather41.png', 'weather42.png', 'weather43.png', 'weather44.png', 'weather45.png'
      ];
  
      for (let i = 0; i < 12; i++) { // Fetching only the first 12 hours
        if (hourlyData[i]) {
          let hourLabel = `Hour ${i + 1}`;
          let temperature = `${hourlyData[i].Temperature.Value}°${hourlyData[i].Temperature.Unit}`;
          let iconValue = hourlyData[i].WeatherIcon; // Get the icon number
  
          console.log(`Hour ${i + 1} - Icon Value: ${iconValue}, Temperature: ${temperature}`);
  
          // Ensure iconValue is within range (1-45), else use a default image
          let imageSrc = 'assets/images/default.png'; // Fallback image
          if (iconValue >= 1 && iconValue <= images.length) {
            imageSrc = `assets/images/${images[iconValue - 1]}`;
          }
  
          // Create an image element
          const img = document.createElement('img');
          img.src = imageSrc;
          img.alt = `Weather Image ${iconValue}`;
          img.style.width = '100%';
          img.style.height = '80px';
          img.style.objectFit = 'contain';
          img.style.objectPosition = 'center';
  
          // Create a new div for each hour
          const newDiv = this.renderer.createElement('div');
          this.renderer.setProperty(newDiv, 'innerHTML', `${hourLabel}: ${temperature}`);
          
          // Style the div
          this.renderer.setStyle(newDiv, 'height', '150px'); // Adjusted height to fit image
          this.renderer.setStyle(newDiv, 'padding', '10px');
          this.renderer.setStyle(newDiv, 'backgroundColor', 'rgb(16, 2, 206)');
          this.renderer.setStyle(newDiv, 'margin', '5px');
          this.renderer.setStyle(newDiv, 'borderRadius', '8px');
          this.renderer.setStyle(newDiv, 'textAlign', 'center');
          this.renderer.setStyle(newDiv, 'fontWeight', 'bold');
  
          // Append the image to the div
          newDiv.appendChild(img);
  
          // Append the div to the container
          this.renderer.appendChild(this.container1.nativeElement, newDiv);
        }
      }
    } else {
      console.error('Invalid hourlyData format');
    }
  
    this.adjustContainerHeight();
  }
  
  

  adjustContainerHeight() {
    // Set max height based on number of divs (each div is about 40px)
    const newHeight = this.divCount * 50; // Adjust height per div
    this.renderer.setStyle(this.container1.nativeElement, 'maxHeight', `${newHeight}px`);
    this.renderer.setStyle(this.container1.nativeElement, 'overflow', 'auto'); // Add scroll if needed
  }

  async loadSavedWeather() {
    const { value } = await Preferences.get({ key: 'weatherData' });
    if (value) {
      this.savedWeatherData = JSON.parse(value);
    }
  }
  

  getWeatherForecastData(locationKey: string) {
    // Variables to store the forecast data
    let fiveDayForecast: any = null;
    let twentyFourHourForecast: any = null;
  
    // Call the 5-day forecast API
    this.weatherService.getWeatherForecastFiveDays(locationKey).subscribe(
      (data: any) => {
        console.log('5-Day Forecast:', data);
        fiveDayForecast = data; // Store the response
  
        // After getting the 5-day forecast, call the 24-hour forecast API
        this.weatherService.getWeatherForecast12Hour(locationKey).subscribe(
          (hourlyData: any) => {
            console.log('24-Hour Forecast:', hourlyData);
            twentyFourHourForecast = hourlyData; // Store the response
  
            // Now both forecasts are available, you can process them
            this.processForecastData(fiveDayForecast, twentyFourHourForecast);
          },
          (error) => console.error('Error fetching 24-hour forecast:', error)
        );
      },
      (error) => console.error('Error fetching 5-day forecast:', error)
    );
  }
  
  // Helper function to process the data
  processForecastData(fiveDay: any, twentyFourHour: any) {
    console.log('Processing Forecast Data...');
    console.log('Five Day Forecast:', fiveDay);
    console.log('24 Hour Forecast:', twentyFourHour);
  }
  
  
}

