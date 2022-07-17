<template>
  <div class="about">
    <h1>Weather in spain</h1>
    {{currentWeather.date}}
    {{currentWeather.time}}
    <img :src='currentWeather.url'/>
  </div>
</template>

<script lang="ts" setup>
type Date = {
  url: string
  date: string
  time: string
}
import { onMounted, ref, computed } from "vue";
import moment from "moment";

const currentIndex = ref<number>(0)
const weatherMeta = ref<Date[]>([])
const currentWeather = computed(() => {
  return weatherMeta.value[currentIndex.value] || {}
})

onMounted(() => {
  const startDate = moment(
    "1-01-2021"
  );
  const endDate = moment(
    "05-01-2021"
  );
  for (let i = startDate; i.isBefore(endDate); i.add("day", 1)) {
    const date = i.format('DD-MM-YYYY');
    for (let hour = 0; hour < 24; hour++) {
      const time = hour < 10 ? `0${hour}` : `${hour}`;
      const url = `https://www.meteociel.fr/cartes_obs/archives/${date}/temp_sp-${time}.png`
      weatherMeta.value.push({
        url,
        date,
        time
      });
    }
  }
  console.log(weatherMeta.value.length)
  setInterval(() => {
    currentIndex.value++;
  }, 100);
})

</script>
