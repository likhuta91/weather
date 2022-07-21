<template>
  <v-container>
      <v-card elevation="0">
        <v-row>
          <v-col sm="7" cols="12" class="d-flex flex-column">
            <h1 class="text-h3 mx-auto">{{selectedWeatherParameterTitle}} in {{selectedRegionTitle}}</h1>
            <h2 class="text-h4 font-weight-bold mx-auto current-date">
              {{currentWeather.date}}
              {{currentWeather.time}}:00
            </h2>
            <v-img
              class="weather-image"
              :src='currentWeather.url'
              :lazy-src="nextWeather.url"
              transition="fade-transition"
            />
          </v-col>
          <v-col sm="5" cols="12">
            <v-row
              no-gutters
            >
              <v-col
                cols="12"
                class="d-flex flex-column justify-center my-2"
                order="2"
                order-sm="1"
              >
                <div class="text-body-1">Weather parameter</div>
                <v-select
                  v-model:model-value="selectedWeatherParameter"
                  :items="weatherParameters"
                  variant="outlined"
                  color="primary"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                class="d-flex flex-column justify-center my-2"
                order="2"
                order-sm="1"
              >
                <div class="text-body-1">Region</div>
                <v-select
                  v-model:model-value="selectedRegion"
                  :items="currentWeatherConfig.regions"
                  variant="outlined"
                  color="primary"
                  hide-details
                />
              </v-col>
              <v-col
                cols="12"
                class="d-flex flex-column justify-center my-2"
                order="3"
                order-sm="2"
              >
                <div class="text-body-1">Time range (hours)</div>
                <v-slider
                  v-model="timeInterval"
                  :ticks="currentWeatherConfig.timeIntervals"
                  :max="7"
                  step="1"
                  show-ticks="always"
                  tick-size="5"
                  color="primary"
                  hide-details
                ></v-slider>
              </v-col>
              <v-col
                cols="12"
                class="d-flex flex-column justify-center my-2"
                order="4"
                order-sm="3"
              >
                <div class="text-body-1">Update frequency (milliseconds)</div>
                <v-slider
                  v-model="updateFrequency"
                  class="align-center"
                  :max="2000"
                  :min="20"
                  step="20"
                  color="primary"
                  hide-details
                >
                  <template v-slot:append>
                    <v-text-field
                      v-model="updateFrequency"
                      hide-details
                      single-line
                      density="compact"
                      type="number"
                      style="width: 100px"
                      variant="outlined"
                      color="primary"
                    ></v-text-field>
                  </template>
                </v-slider>
              </v-col>
              <v-col
                cols="12"
                class="d-flex justify-center my-2"
                order="5"
                order-sm="4"
              >
                <date-picker
                  v-model="dateRange"
                  format="DD-MM-YYYY"
                  is-range
                  :max-date="new Date()"
                />
              </v-col>
              <v-col
                cols="12"
                class="d-flex justify-center my-2"
                order="1"
                order-sm="5"
              >
                <v-btn
                  :disabled="currentIndex === 0"
                  @click="onClickReturnToStart"
                  icon="mdi-keyboard-return"
                  color="primary"
                />
                <v-btn
                  :disabled="currentIndex === 0"
                  @click="onClickPrevDay"
                  icon="mdi-skip-backward"
                  color="primary"
                />
                <v-btn
                  :disabled="currentIndex === 0"
                  @click="onClickPrev"
                  icon="mdi-skip-previous"
                  color="primary"
                />
                <v-btn
                  :icon="isPlayed? 'mdi-pause' : 'mdi-play'"
                  :disabled="isLastMeta"
                  @click="onTogglePlay"
                  color="primary"
                />
                <v-btn
                  :disabled="isLastMeta"
                  @click="onClickNext"
                  icon="mdi-skip-next"
                  color="primary"
                />
                <v-btn
                  :disabled="isLastMeta"
                  @click="onClickNextDay"
                  icon="mdi-skip-forward"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
</template>

<script lang="ts" setup>
type DateMeta = {
  url: string
  date: string
  time: string
}
type DateRangeType = {start: Date, end: Date}

import { ref, computed, watchEffect } from "vue";
import moment from "moment";
import { DatePicker } from 'v-calendar';
import {temperatureConfig, solarLightingConfig, WeatherConfig, rainConfig} from './weatherHelper'

const weatherParameters: {value: string, title: string, config: WeatherConfig}[] = [
  {value: 'temp', title: 'Temperature', config: temperatureConfig},
  {value: 'enso', title: 'Solar lighting', config: solarLightingConfig},
  {value: 'rr2', title: 'Rain', config: rainConfig},
]

const selectedWeatherParameter = ref<string>(weatherParameters[0].value)
const selectedRegion = ref<string>('')
const currentIndex = ref<number>(0)
const updateFrequency = ref<number>(200)
let interval = 0
const timeInterval = ref<number>(0)
const isPlayed = ref<boolean>(false)
const newDate = new Date()
newDate.setDate(newDate.getDate() - 1);
const dateRange = ref<DateRangeType>({ start: newDate, end: new Date()})
const weatherMeta = ref<DateMeta[]>([])

const currentWeather = computed(() => {
  return weatherMeta.value[currentIndex.value] || {}
})
const nextWeather = computed(() => {
  return weatherMeta.value[currentIndex.value + 1] || {}
})
const isLastMeta = computed(() => {
  return currentIndex.value === weatherMeta.value.length - 1
})
const selectedRegionTitle = computed(() => {
  return currentWeatherConfig.value?.regions.find(el => el.value === selectedRegion.value)?.title
})
const selectedWeatherParameterTitle = computed(() => {
  const title = weatherParameters.find(el => el.value === selectedWeatherParameter.value)?.title
  return title || weatherParameters[0].title
})
const currentWeatherConfig = computed(() => {
  const config = weatherParameters.find(el => el.value === selectedWeatherParameter.value)?.config
  return config || weatherParameters[0].config
})

function onClickReturnToStart() {
  if(isPlayed.value) {
    stopPlaying()
  }
  currentIndex.value = 0
}

function onClickPrevDay() {
  if(isPlayed.value) {
    stopPlaying()
  }
  const countTimeIntervalsInOneDay = 24 / +currentWeatherConfig.value.timeIntervals[timeInterval.value]
  if(currentIndex.value - countTimeIntervalsInOneDay <= 0) {
    currentIndex.value = 0
  } else {
    currentIndex.value = currentIndex.value - countTimeIntervalsInOneDay
  }
}

function onClickPrev() {
  if(isPlayed.value) {
    stopPlaying()
  }
  currentIndex.value--
}

function onTogglePlay() {
  if(isPlayed.value) {
    stopPlaying()
  } else{
    isPlayed.value = true
    interval = setInterval(() => {
      currentIndex.value++;
    }, updateFrequency.value);
  }
}

function onClickNext() {
  if(isPlayed.value) {
    stopPlaying()
  }
  currentIndex.value++
}

function onClickNextDay() {
  if(isPlayed.value) {
    stopPlaying()
  }
  const countTimeIntervalsInOneDay = 24 / +currentWeatherConfig.value.timeIntervals[timeInterval.value]
  if(currentIndex.value + countTimeIntervalsInOneDay > weatherMeta.value.length - 1) {
    currentIndex.value = weatherMeta.value.length - 1
  } else {
    currentIndex.value = currentIndex.value + countTimeIntervalsInOneDay
  }
}

function calculateDateRange(dateRange: DateRangeType, timeInterval: number, region: string, weatherParameter: string) {
  currentIndex.value = 0
  weatherMeta.value = []
  const parsedStartDate = moment(
    dateRange.start,
    "DD-MM-YYYY"
  );
  const parsedEndDate = moment(
    dateRange.end,
    "DD-MM-YYYY"
  );
  for (let i = parsedStartDate; i.isSameOrBefore(parsedEndDate); i.add(1, "days")) {
    const date = i.format('DD-MM-YYYY');
    const hoursInDay = i.isSame(parsedEndDate) ? new Date().getHours() - 2: 24
    for (let hour = 0; hour < hoursInDay; hour = hour + timeInterval) {
      const time = hour < 10 ? `0${hour}` : `${hour}`;
      if(currentWeatherConfig.value) {
        const url = currentWeatherConfig.value.builderUrl({
          date,
          region,
          time,
        })
        weatherMeta.value.push({
          url,
          date,
          time
        })
      }
    }
  }
}

function stopPlaying() {
  clearInterval(interval)
  isPlayed.value = false
}

watchEffect(() => {
  if(currentIndex.value >= weatherMeta.value.length - 1) {
    stopPlaying()
  }
})
watchEffect(() => {
  calculateDateRange(dateRange.value, +currentWeatherConfig.value.timeIntervals[timeInterval.value], selectedRegion.value, selectedWeatherParameter.value)
  stopPlaying()
})
watchEffect(() => {
  if(updateFrequency.value) {
    stopPlaying()
  }
})
watchEffect(() => {
  if(currentWeatherConfig.value) {
    selectedRegion.value = currentWeatherConfig.value.regions[0].value
  }
})
</script>

<style lang="scss" scoped>
  .weather-image {
    max-width: calc(100vh - 8rem);
    max-height: calc(100vh - 8rem);
    width: 100%;
    margin: 0 auto;
  }
  .period-input {
    width: 8rem;
    max-width: 8rem;
  }
  .current-date {
    color: rgb(var(--v-theme-primary));
  }
</style>
