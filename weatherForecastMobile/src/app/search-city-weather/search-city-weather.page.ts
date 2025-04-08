import { Component, OnInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherService } from '../weather.service';
import { AlertController } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-search-city-weather',
  templateUrl: './search-city-weather.page.html',
  styleUrls: ['./search-city-weather.page.scss'],
  standalone: false,
})
export class SearchCityWeatherPage {
  suggestion: any[] = [];

  
  searchResults: any[] = []; 
  selectedCity: string = ''; // ✅ Store selected city
  locationDataLocationKey: string | null = null;
  weatherData: any; // ✅ Store full weather data object
  weatherDataFive: any;
  weatherData24: any;
  isDarkMode: boolean = false;
  tempValue: boolean = false;
  darkMode: boolean = false;
  Faren: string = "Farenheit";
  Cel: string = "celcius";
  Light: string = "Light";
  Dark: string = "Dark";
 
  locationKey = 'YOUR_LOCATION_KEY'; // Replace with a valid location key
  weatherCondition: any;
  AlertStoreCityName: string = "";

  @ViewChild('container1', { static: false }) container1!: ElementRef;
  @ViewChild('container2', { static: false }) container2!: ElementRef;
  divCount = 0; // Keep track of the number of divs

  
  cityName: string = ''; // Default
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

  TemptemperatureC: number | null = null;
  TemptemperatureF: number | null = null;
  TempminTempC: number | null = null;
  TempmaxTempC: number | null = null;
  TempminTempF: number | any | null = null;
  TempmaxTempF: number | any | null = null;
  Temphumidity: number | null = null;
  TempwindSpeed: number | null = null;

  savedWeatherData: {
    temperatureC?: number | null;
    temperatureF?: number | null;
    minTempC?: number;
    maxTempC?: number;
    minTempF?: number;
    maxTempF?: number;
    windSpeed?: number | null;
    humidity?: number | null;
    cityName?: String;
  } = {};


  constructor(private router: Router, private weatherService: WeatherService, private alertController: AlertController, private renderer: Renderer2) { }
   
  async ngOnInit() {

    this.loadSavedWeather();

   
    const cachedCityName = await this.loadCityName();
  


    if (cachedCityName) {
      this.renderTwelveHourForecast(cachedCityName); // <- same here
    }
  
  
    const cachedCity = await this.loadCityName();

    if (cachedCity) {
      this.cityName = cachedCity;
  
      if (navigator.onLine) {
        this.getWeather(); // Live data
      } else {
        const cachedWeather = await this.loadWeatherData();
        if (cachedWeather) {
          this.temperatureC = cachedWeather.temperatureC;
          this.temperatureF = cachedWeather.temperatureF;
          this.windSpeed = cachedWeather.windSpeed;
          this.humidity = cachedWeather.humidity;
          this.minTempC = cachedWeather.minTempC;
          this.maxTempC = cachedWeather.maxTempC;
          this.minTempF = cachedWeather.minTempF;
          this.maxTempF = cachedWeather.maxTempF;
        } else {
          this.errorMessage = 'No cached weather data available.';
        }
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
  
    this.showCityPrompt(); // This will override cache once user searches
  }
  

  async showCityPrompt() {
    const alert = await this.alertController.create({
      header: 'Enter City Name',
      inputs: [
        {
          name: 'city',
          type: 'text',
          placeholder: 'e.g. New York',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Search',
          handler: async (data) => {
            if (data.city?.trim()) {
              this.cityName = data.city.trim();
              await this.saveCityName(this.cityName); // ✅ Save it!
              this.getWeather(); // 🔥 Call weather fetch
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  getWeather() {
    this.isLoading = true;
    this.errorMessage = '';

    this.weatherService.getLocationKey(this.cityName).subscribe({
      next: (locationRes) => {
        const locationKey = locationRes[0]?.Key;
        if (!locationKey) {
          this.isLoading = false;
          this.errorMessage = 'Location key not found.';
          return;
        }

        // this.addDiv1(locationKey);
        // this.addDiv2(locationKey);

        this.savedWeatherData.cityName = this.cityName

        // ✅ Get Current Conditions
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
          await this.saveWeatherData(weatherData);
        }

        

      },
      error: (err) => {
        this.errorMessage = 'Failed to get location key.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  convertToCelsius(fahrenheit: number): number {
    return Math.round((fahrenheit - 32) * 5 / 9);
  }

  addDiv1(locationKey: string) {
    this.weatherService.getWeatherForecastFiveDays(this.locationKeyInformation).subscribe(
      (data: any) => {
        console.log('5-Day Forecast:', data);

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
            this.renderer.setStyle(newDiv, 'backgroundColor', 'lightblue');
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
      },
      (error) => console.error('Error fetching 5-day forecast:', error)
    );
}


  addDiv2(locationKey: string) {
    // Call the 5-day forecast API
    this.weatherService.getWeatherForecastFiveDays(this.locationKeyInformation).subscribe(
      (data: any) => {
        console.log('5-Day Forecast:', data);
  
        // After getting the 5-day forecast, call the 12-hour forecast API
        this.weatherService.getWeatherForecast12Hour(this.locationKeyInformation).subscribe(
          (hourlyData: any) => {
            console.log('12-Hour Forecast inside div:', hourlyData);
  
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
                  this.renderer.setStyle(newDiv, 'backgroundColor', 'lightblue');
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
          },
          (error) => console.error('Error fetching 12-hour forecast:', error)
        );
      },
      (error) => console.error('Error fetching 5-day forecast:', error)
    );
}

  

  adjustContainerHeight() {
    // Set max height based on number of divs (each div is about 40px)
    const newHeight = this.divCount * 50; // Adjust height per div
    this.renderer.setStyle(this.container1.nativeElement, 'maxHeight', `${newHeight}px`);
    this.renderer.setStyle(this.container1.nativeElement, 'overflow', 'auto'); // Add scroll if needed
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
    this.router.navigate(['/home']);
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



async saveCityName(cityName: string) {
  await Preferences.set({
    key: 'CityName',
    value: JSON.stringify(cityName)
  });
}

async loadCityName(): Promise<string | null> {
  const { value } = await Preferences.get({ key: 'CityName' });
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
      this.renderer.setStyle(newDiv, 'backgroundColor', 'rgb(16, 2, 206)');
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

async loadSavedWeather() {
  const { value } = await Preferences.get({ key: 'weatherData' });
  if (value) {
    this.savedWeatherData = JSON.parse(value);
  }
}



}
