<template>
  <div class="detail">
    <button @click="$router.back()" class="back-btn">← 返回</button>
    <h1>{{ cityName }} 天气详情</h1>
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else>
      <div class="current">
        <div class="temp">{{ current.temp }}°C</div>
        <div class="info">湿度 {{ current.humidity }}% | 风速 {{ current.windSpeed }} km/h</div>
        <div class="info">体感温度 {{ current.feelsLike }}°C | 能见度 {{ current.visibility }} km</div>
      </div>
      
      <!-- 用一个明确的 id 来定位 -->
      <div id="weather-chart" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { getCurrentWeather, get5DayForecast, searchCity } from '../utils/weatherApi'

const route = useRoute()
const cityName = route.params.cityName

const loading = ref(true)
const current = ref({
  temp: '',
  humidity: '',
  windSpeed: '',
  feelsLike: '',
  visibility: ''
})

onMounted(async () => {
  try {
    let finalLat, finalLon
    
    // 尝试从路由参数获取经纬度
    const paramLat = parseFloat(route.params.lat)
    const paramLon = parseFloat(route.params.lon)
    
    if (!isNaN(paramLat) && !isNaN(paramLon)) {
      finalLat = paramLat
      finalLon = paramLon
      console.log('使用路由参数中的经纬度:', finalLat, finalLon)
    } else {
      console.log('路由参数无效，重新搜索城市:', cityName)
      const locationData = await searchCity(cityName)
      if (locationData && locationData.length > 0) {
        finalLat = locationData[0].lat
        finalLon = locationData[0].lon
        console.log('搜索到的经纬度:', finalLat, finalLon)
      } else {
        alert('无法获取城市位置')
        loading.value = false
        return
      }
    }
    
    // 获取天气数据
    const weather = await getCurrentWeather(finalLat, finalLon)
    const forecastData = await get5DayForecast(finalLat, finalLon)
    
    // 填充当前天气
    current.value = {
      temp: Math.round(weather.main.temp),
      humidity: weather.main.humidity,
      windSpeed: weather.wind.speed,
      feelsLike: Math.round(weather.main.feels_like),
      visibility: (weather.visibility / 1000).toFixed(1)
    }
    
    // 处理5天预报
    const dailyForecast = {}
    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0]
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: date,
          tempMax: Math.round(item.main.temp_max),
          tempMin: Math.round(item.main.temp_min)
        }
      } else {
        dailyForecast[date].tempMax = Math.max(dailyForecast[date].tempMax, Math.round(item.main.temp_max))
        dailyForecast[date].tempMin = Math.min(dailyForecast[date].tempMin, Math.round(item.main.temp_min))
      }
    })
    
    const chartData = Object.values(dailyForecast).slice(0, 5)
    console.log('图表数据:', chartData)
    
    // 关闭 loading，让 DOM 渲染出来
    loading.value = false
    
    // 等待 DOM 更新完成
    await nextTick()
    
    // 延迟一点确保 DOM 完全渲染
    setTimeout(() => {
      // 直接用 id 获取元素
      const chartDom = document.getElementById('weather-chart')
      console.log('找到的图表容器:', chartDom)
      
      if (chartDom) {
        const chart = echarts.init(chartDom)
        chart.setOption({
          title: { text: '未来5天温度趋势', left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: chartData.map(d => d.date) },
          yAxis: { type: 'value', name: '温度(°C)' },
          series: [
            { name: '最高温', type: 'line', data: chartData.map(d => d.tempMax), smooth: true, color: '#ff6b6b' },
            { name: '最低温', type: 'line', data: chartData.map(d => d.tempMin), smooth: true, color: '#4ecdc4' }
          ]
        })
        console.log('图表渲染成功')
      } else {
        console.error('仍然找不到图表容器')
      }
    }, 100)
    
  } catch (error) {
    console.error('加载失败:', error)
    alert('加载失败，请检查网络')
    loading.value = false
  }
})
</script>

<style scoped>
.detail { padding: 20px; max-width: 800px; margin: 0 auto; }
.back-btn { margin-bottom: 20px; padding: 8px 16px; background: #42b883; color: white; border: none; border-radius: 8px; cursor: pointer; }
.loading { text-align: center; padding: 40px; }
.current { text-align: center; padding: 30px; background: #f0f0f0; border-radius: 20px; margin-bottom: 30px; }
.temp { font-size: 64px; font-weight: bold; color: #ff6b6b; }
.info { color: #666; margin-top: 10px; }
.chart { height: 400px; width: 100%; margin-top: 20px; }

/* 深色模式 */
:root.dark .current { background: #333; color: white; }
:root.dark .info { color: #ccc; }

@media (max-width: 768px) {
  .detail { padding: 10px; }
  .temp { font-size: 48px; }
  .chart { height: 300px; }
}
</style>