import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchCityWeatherPageRoutingModule } from './search-city-weather-routing.module';

import { SearchCityWeatherPage } from './search-city-weather.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchCityWeatherPageRoutingModule
  ],
  declarations: [SearchCityWeatherPage]
})
export class SearchCityWeatherPageModule {}
