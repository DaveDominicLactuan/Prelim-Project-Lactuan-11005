import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchCityWeatherPage } from './search-city-weather.page';

describe('SearchCityWeatherPage', () => {
  let component: SearchCityWeatherPage;
  let fixture: ComponentFixture<SearchCityWeatherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCityWeatherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
