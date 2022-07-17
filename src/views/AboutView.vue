<template>
  <div class="about">
    <v-container>
      <v-card>
        <v-row>
          <v-col sm="7" cols="12" class="d-flex flex-column">
            <h1 class="text-h3 mx-auto">Temperature in Spain</h1>
            <h2 class="text-h4 font-weight-bold mx-auto current-date">
              {{currentWeather.date}}
              {{currentWeather.time}}:00
            </h2>
            <v-img
              class="weather-image"
              :src='currentWeather.url'
            />
          </v-col>
          <v-col sm="5" cols="12">
            <v-row
              no-gutters
            >
              <v-col cols="12" class="d-flex justify-center my-2">
                <v-text-field
                  v-model="updatePeriod"
                  type="number"
                  variant="outlined"
                  class="period-input"
                  density="compact"
                  label="Period (milliseconds)"
                  hide-details
                />
              </v-col>
              <v-col cols="12" class="d-flex justify-center my-2">
                <date-picker
                  v-model="dateRange"
                  format="DD-MM-YYYY"
                  is-range
                  :max-date="new Date()"
                />
              </v-col>
              <v-col cols="12" class="d-flex justify-center my-2">
                <v-btn
                  icon="mdi-skip-backward"
                  :disabled="currentIndex === 0"
                  @click="onClickPrevDay"
                />
                <v-btn
                  icon="mdi-skip-previous"
                  :disabled="currentIndex === 0"
                  @click="onClickPrev"
                />
                <v-btn
                  :icon="isPlayed? 'mdi-pause' : 'mdi-play'"
                  :disabled="isLastMeta"
                  @click="onTogglePlay"
                />
                <v-btn
                  icon="mdi-skip-next"
                  :disabled="isLastMeta"
                  @click="onClickNext"
                />
                <v-btn
                  icon="mdi-skip-forward"
                  :disabled="isLastMeta"
                  @click="onClickNextDay"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
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

const currentIndex = ref<number>(0)
const updatePeriod = ref<number>(200)
const interval = ref<number>()
const isPlayed = ref<boolean>(false)
const dateRange = ref<DateRangeType>({ start: new Date(2022, 6, 1), end: new Date(2022, 6, 2)})
const weatherMeta = ref<DateMeta[]>([])

const currentWeather = computed(() => {
  return weatherMeta.value[currentIndex.value] || {}
})
const isLastMeta = computed(() => {
  return currentIndex.value === weatherMeta.value.length - 1
})

function onClickPrevDay() {
  if(isPlayed.value) {
    isPlayed.value = false
    clearInterval(interval.value) 
  }
  if(currentIndex.value - 24 <= 0) {
    currentIndex.value = 0
  } else {
    currentIndex.value = currentIndex.value - 24
  }
}

function onClickPrev() {
  if(isPlayed.value) {
    isPlayed.value = false
    clearInterval(interval.value) 
  }
  currentIndex.value--
}

function onTogglePlay() {
  if(isPlayed.value) {
    isPlayed.value = false
    clearInterval(interval.value) 
  } else{
    isPlayed.value = true
    interval.value = setInterval(() => {
      currentIndex.value++;
    }, updatePeriod.value);
  }
}

function onClickNext() {
  if(isPlayed.value) {
    isPlayed.value = false
    clearInterval(interval.value) 
  }
  currentIndex.value++
}

function onClickNextDay() {
  if(isPlayed.value) {
    isPlayed.value = false
    clearInterval(interval.value) 
  }
  if(currentIndex.value + 24 > weatherMeta.value.length - 1) {
    currentIndex.value = weatherMeta.value.length - 1
  } else {
    currentIndex.value = currentIndex.value + 24
  }
}

function calculateDateRange(dateRange: DateRangeType) {
  weatherMeta.value = []
  const parsedStartDate = moment(
    dateRange.start,
    "DD-MM-YYYY"
  );
  const parsedEndDate = moment(
    dateRange.end,
    "DD-MM-YYYY"
  );
  for (let i = parsedStartDate; i.isBefore(parsedEndDate); i.add(1, "days")) {
    const date = i.format('DD-MM-YYYY');
    for (let hour = 0; hour < 24; hour = hour + 4) {
      const time = hour < 10 ? `0${hour}` : `${hour}`;
      const url = `https://www.meteociel.fr/cartes_obs/archives/${date}/temp_sp-${time}.png`
      weatherMeta.value.push({
        url,
        date,
        time
      });
    }
  }
}

watchEffect(() => {
  if(currentIndex.value >= weatherMeta.value.length - 1) {
    isPlayed.value = false
    clearInterval(interval.value)
  }
})
watchEffect(() => {
  calculateDateRange(dateRange.value)
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
    width: 7rem;
    max-width: 7rem;
  }
  .current-date {
    color: rgb(var(--v-theme-success));
  }
</style>
