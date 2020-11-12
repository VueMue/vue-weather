import axios from 'axios';

const APİ_KEY = '9ee2baf340482a5aa367134760437315';
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

const UNIT_TYPE = 'metric';

export default {
  getWeatherByCityName(city_name) {
    // return axios.get(`api.openweathermap.org/data/2.5/weather?id=${city_name}&appid=${APİ_KEY}`);
    return axios.get(`${BASE_URL}weather?q=${city_name}&appid=${APİ_KEY}`);
  },
  getWeatherByCoordinates(lat, lon) {
    return axios.get(`${BASE_URL}weather?lat=${lat}&lon=${lon}&units=${UNIT_TYPE}&APPID=${APİ_KEY}`);
  }
}