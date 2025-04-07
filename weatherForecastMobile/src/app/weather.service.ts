import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '8iDFfkDVn4KqnCYrfIb7Ypj8MJQjedG8'; 
//  private apiKey = ''; 
  private baseUrl = 'https://dataservice.accuweather.com/forecasts/v1/hourly/1hour';
  private getLocationName = 'https://dataservice.accuweather.com/locations/v1/cities/geoposition/search';
  private getLocationKeyValue = 'https://dataservice.accuweather.com/locations/v1/cities/search';
  private forecastOneDay = 'https://dataservice.accuweather.com/forecasts/v1/daily/1day/';
  private autocompleteUrl = 'https://dataservice.accuweather.com/locations/v1/cities/autocomplete';
  private LocationCondition = 'https://dataservice.accuweather.com/currentconditions/v1/{locationKey}';
  private forecastFiveDay = 'https://dataservice.accuweather.com/forecasts/v1/daily/5day/';
  private forecastTwelveHour = 'https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
  private forecast24HourDay = 'https://dataservice.accuweather.com/forecasts/v1/hourly/24hour/';

  constructor(private http: HttpClient) {}

  getWeather(locationKey: string, language: string = 'en-us', metric: boolean = true): Observable<any> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('language', language)
      .set('metric', metric.toString());

    return this.http.get(`${this.baseUrl}/${locationKey}`, { params });
  }

  getLocationByCoordinates(latitude: number, longitude: number): Observable<any> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('q', `${latitude},${longitude}`);

    return this.http.get(this.getLocationName, { params });
  }

  getLocationKey(cityName: string): Observable<any> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('q', cityName);

    return this.http.get(this.getLocationKeyValue, { params });
  }

  getWeatherForecast(locationKey: string): Observable<any> {
    const url = `${this.forecastOneDay}${locationKey}?apikey=${this.apiKey}`;
    return this.http.get(url);
  }

  getWeatherForecast2(locationKey: string): Observable<any> {
    const currentConditionsUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${this.apiKey}`;
    return this.http.get(currentConditionsUrl);
  }

  getCitySuggestion(cityName: string): Observable<any> {
    const url = `${this.autocompleteUrl}?apikey=${this.apiKey}&q=${cityName}`;
    console.log('Calling API:', url);
    return this.http.get(url).pipe(
      tap(response => console.log('API Response:', response)),
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => new Error(error.message || 'Unknown error'));
      })
    );
  }

  getCurrentConditions(locationKey: string): Observable<any> {
    const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${this.apiKey}&details=true`;
    return this.http.get(url).pipe(
      catchError(error => {
        console.error('Error fetching current conditions:', error);
        return throwError(() => new Error(error.message || 'Unknown error'));
      })
    );
  }

  getWeatherForecastFiveDays(locationKey: string): Observable<any> {
    const url = `${this.forecastFiveDay}${locationKey}?apikey=${this.apiKey}`;
    return this.http.get(url);
  }

  getWeatherForecast12Hour(locationKey: string): Observable<any> {
    const url = `${this.forecastTwelveHour}${locationKey}?apikey=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(error => {
        console.error('Error fetching 12-hour forecast:', error);
        return throwError(() => new Error(error.message || 'Unknown error occurred.'));
      })
    );
  }

  getCurrentConditions2(locationKey: string): Observable<any> {
    const url = this.LocationCondition.replace('{locationKey}', locationKey).replace('http://', 'https://') + `?apikey=${this.apiKey}`;
    return this.http.get(url).pipe(
      catchError(error => {
        console.error('Error fetching current conditions:', error);
        return throwError(() => new Error(error.message || 'Unknown error'));
      })
    );
  }
}
