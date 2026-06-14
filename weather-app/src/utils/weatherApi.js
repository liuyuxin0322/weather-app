import axios from 'axios'

// OpenWeatherMap API Key
const API_KEY = 'fff8569857d2163b7b98498be7b982a6'

// 搜索城市（获取经纬度）
export async function searchCity(cityName) {
  const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
    params: { q: cityName, limit: 1, appid: API_KEY }
  })
  return response.data
}

// 获取当前天气
export async function getCurrentWeather(lat, lon) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat, lon, appid: API_KEY, units: 'metric' }
  })
  return response.data
}

// 获取5天预报
export async function get5DayForecast(lat, lon) {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: { lat, lon, appid: API_KEY, units: 'metric' }
  })
  return response.data
}