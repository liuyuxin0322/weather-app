import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CityDetail from '../views/CityDetail.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { 
    // 让 lat 和 lon 变成可选参数（加问号）
    path: '/city/:cityId/:cityName/:lat?/:lon?',
    name: 'cityDetail', 
    component: CityDetail 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router