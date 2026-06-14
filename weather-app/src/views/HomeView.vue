<template>
  <div class="home">
    <div class="header">
      <h1>天气查询</h1>
      <button @click="toggleTheme" class="theme-btn">🌓</button>
    </div>

    <div class="search-box">
      <input 
        v-model="searchKeyword" 
        @keyup.enter="searchCity"
        placeholder="输入城市英文名（如 Beijing）"
      />
      <button @click="searchCity">搜索</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-if="currentWeather" class="current-weather">
      <h2>{{ currentCityName }}</h2>
      <div class="temp">{{ currentWeather.temp }}°C</div>
      <div class="info">湿度 {{ currentWeather.humidity }}% | 风速 {{ currentWeather.windSpeed }} km/h</div>
    </div>

    <div v-if="forecast.length" class="forecast">
      <h3>5天预报</h3>
      <div class="forecast-list">
        <div v-for="day in forecast" :key="day.date" class="forecast-card">
          <div>{{ day.date }}</div>
          <div>{{ day.tempMax }}°/{{ day.tempMin }}°</div>
          <div>{{ day.text }}</div>
        </div>
      </div>
    </div>

    <div class="city-list">
      <h3>我的城市（可拖拽排序）</h3>
      <div class="city-items" ref="cityListRef">
        <div 
          v-for="(city, index) in cityStore.cities" 
          :key="city.id"
          class="city-item"
          :class="{ 'dragging': dragIndex === index }"
          :data-index="index"
          @mousedown="startDrag($event, index)"
        >
          <span class="drag-handle">⋮⋮</span>
          <span class="city-name" @click="goToDetail(city)">{{ city.name }}</span>
          <button @click.stop="cityStore.removeCity(city.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCityStore } from '../stores/cityStore'
import { searchCity as searchCityAPI, getCurrentWeather, get5DayForecast } from '../utils/weatherApi'

const router = useRouter()
const cityStore = useCityStore()

const searchKeyword = ref('')
const loading = ref(false)
const currentWeather = ref(null)
const forecast = ref([])
const currentCityName = ref('')

// 拖拽相关
const cityListRef = ref(null)
const dragIndex = ref(null)
const dragStartY = ref(0)
const isDragging = ref(false)

function startDrag(event, index) {
  if (event.target.tagName === 'BUTTON') return
  
  dragIndex.value = index
  dragStartY.value = event.clientY
  isDragging.value = true
  
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', stopDrag)
  
  event.preventDefault()
}

function onDragMove(event) {
  if (!isDragging.value || dragIndex.value === null) return
  
  const moveY = event.clientY - dragStartY.value
  if (Math.abs(moveY) < 10) return
  
  const items = document.querySelectorAll('.city-item:not(.dragging)')
  let newIndex = dragIndex.value
  
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect()
    const middle = rect.top + rect.height / 2
    if (event.clientY > middle) {
      newIndex = i
      if (newIndex >= dragIndex.value) newIndex++
    }
  }
  
  if (newIndex !== dragIndex.value && newIndex >= 0 && newIndex <= cityStore.cities.length) {
    const cities = [...cityStore.cities]
    const [draggedItem] = cities.splice(dragIndex.value, 1)
    cities.splice(newIndex, 0, draggedItem)
    cityStore.cities = cities
    cityStore.save()
    dragIndex.value = newIndex
    dragStartY.value = event.clientY
  }
}

function stopDrag() {
  isDragging.value = false
  dragIndex.value = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', stopDrag)
}

async function searchCity() {
  if (!searchKeyword.value) return
  
  loading.value = true
  
  try {
    const locationData = await searchCityAPI(searchKeyword.value)
    
    if (locationData && locationData.length > 0) {
      const city = locationData[0]
      currentCityName.value = city.name
      
      const weather = await getCurrentWeather(city.lat, city.lon)
      const forecastData = await get5DayForecast(city.lat, city.lon)
      
      currentWeather.value = {
        temp: Math.round(weather.main.temp),
        humidity: weather.main.humidity,
        windSpeed: weather.wind.speed
      }
      
      const dailyForecast = {}
      forecastData.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0]
        if (!dailyForecast[date]) {
          dailyForecast[date] = {
            date: date,
            tempMax: Math.round(item.main.temp_max),
            tempMin: Math.round(item.main.temp_min),
            text: item.weather[0].description
          }
        } else {
          dailyForecast[date].tempMax = Math.max(dailyForecast[date].tempMax, Math.round(item.main.temp_max))
          dailyForecast[date].tempMin = Math.min(dailyForecast[date].tempMin, Math.round(item.main.temp_min))
        }
      })
      
      forecast.value = Object.values(dailyForecast).slice(0, 5)
      
      cityStore.addCity({ id: city.name, name: city.name, lat: city.lat, lon: city.lon })
    } else {
      alert('未找到该城市，请输入英文名（如 Beijing）')
    }
  } catch (error) {
    console.error(error)
    alert('请求失败，请检查网络')
  } finally {
    loading.value = false
  }
}

function goToDetail(city) {
  router.push({ 
    name: 'cityDetail', 
    params: { 
      cityId: city.id, 
      cityName: city.name,
      lat: city.lat,
      lon: city.lon
    } 
  })
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark')
}
</script>

<style scoped>
.home { padding: 20px; max-width: 1200px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: center; }
.search-box { display: flex; gap: 10px; margin: 20px 0; }
.search-box input { flex: 1; padding: 10px; font-size: 16px; border: 1px solid #ddd; border-radius: 8px; }
.search-box button { padding: 10px 20px; background: #42b883; color: white; border: none; border-radius: 8px; cursor: pointer; }
.loading { text-align: center; padding: 20px; }
.current-weather { text-align: center; padding: 20px; background: #f0f0f0; border-radius: 20px; margin: 20px 0; }
.temp { font-size: 48px; font-weight: bold; }
.info { color: #666; margin-top: 10px; }
.forecast-list { display: flex; gap: 10px; overflow-x: auto; padding: 10px 0; }
.forecast-card { min-width: 100px; padding: 10px; background: #e0e0e0; border-radius: 10px; text-align: center; }
.city-list { margin-top: 20px; }
.city-items { min-height: 100px; }
.city-item { 
  display: flex; 
  align-items: center; 
  padding: 12px; 
  margin: 5px 0; 
  background: #f9f9f9; 
  border-radius: 8px; 
  transition: all 0.2s;
}
.city-item.dragging {
  opacity: 0.5;
  background: #e0e0e0;
}
.drag-handle { 
  cursor: grab; 
  margin-right: 12px; 
  color: #999; 
  font-size: 18px;
  user-select: none;
}
.drag-handle:active { cursor: grabbing; }
.city-name { flex: 1; cursor: pointer; }
.city-name:hover { text-decoration: underline; }
.city-item button { padding: 5px 10px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer; }
.theme-btn { font-size: 24px; padding: 5px 10px; cursor: pointer; background: none; border: none; }

/* 深色模式 */
:root.dark .current-weather { background: #333; color: white; }
:root.dark .forecast-card { background: #444; color: white; }
:root.dark .city-item { background: #2a2a2a; color: white; }
:root.dark .city-item.dragging { background: #3a3a3a; }
:root.dark body { background: #1a1a1a; color: white; }
:root.dark .search-box input { background: #333; color: white; border-color: #555; }

/* 响应式 */
@media (max-width: 768px) {
  .home { padding: 10px; }
  .temp { font-size: 36px; }
  .forecast-card { min-width: 80px; font-size: 12px; }
  .city-item { padding: 8px; }
}
</style>