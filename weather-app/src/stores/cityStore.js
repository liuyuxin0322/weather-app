import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCityStore = defineStore('city', () => {
  const cities = ref(JSON.parse(localStorage.getItem('myCities') || '[]'))

  function save() {
    localStorage.setItem('myCities', JSON.stringify(cities.value))
  }

  function addCity(city) {
    if (!cities.value.find(c => c.id === city.id)) {
      cities.value.push(city)
      save()
    }
  }

  function removeCity(cityId) {
    cities.value = cities.value.filter(c => c.id !== cityId)
    save()
  }

  return { cities, addCity, removeCity, save }
})