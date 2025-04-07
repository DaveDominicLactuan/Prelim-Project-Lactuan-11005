import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchCityWeatherPage } from './search-city-weather.page';

const routes: Routes = [
  {
    path: '',
    component: SearchCityWeatherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchCityWeatherPageRoutingModule {}
