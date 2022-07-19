<template>
  <v-container>
      <v-card elevation="0">
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
              <v-col
                cols="12"
                class="d-flex flex-column justify-center my-2"
                order="2"
                order-sm="1"
              >
                <div class="text-body-1">Time range (hours)</div>
                <v-slider
                  v-model="timeInterval"
                  :ticks="timeIntervalLabel"
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
                order="3"
                order-sm="2"
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
                    ></v-text-field>
                  </template>
                </v-slider>
              </v-col>
              <v-col
                cols="12"
                class="d-flex justify-center my-2"
                order="4"
                order-sm="3"
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
                order-sm="4"
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
const timeIntervalLabel: Record<number, string> = {
  0: '1',
  1: '2',
  2: '3',
  3: '4',
  4: '6',
  5: '8',
  6: '12',
  7: '24',
}

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
const isLastMeta = computed(() => {
  return currentIndex.value === weatherMeta.value.length - 1
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
  const countTimeIntervalsInOneDay = 24 / +timeIntervalLabel[timeInterval.value]
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
  const countTimeIntervalsInOneDay = 24 / +timeIntervalLabel[timeInterval.value]
  if(currentIndex.value + countTimeIntervalsInOneDay > weatherMeta.value.length - 1) {
    currentIndex.value = weatherMeta.value.length - 1
  } else {
    currentIndex.value = currentIndex.value + countTimeIntervalsInOneDay
  }
}

function calculateDateRange(dateRange: DateRangeType, timeInterval: number) {
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
      const url = `https://www.meteociel.fr/cartes_obs/archives/${date}/temp_sp-${time}.png`
      weatherMeta.value.push({
        url,
        date,
        time
      });
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
  calculateDateRange(dateRange.value, +timeIntervalLabel[timeInterval.value])
  stopPlaying()
})
watchEffect(() => {
  if(updateFrequency.value) {
    stopPlaying()
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
