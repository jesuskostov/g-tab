<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// get date and format it like Sunday 29 September 2024
const date = ref(
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
);

// get location https://api.ipgeolocation.io/ipgeo?apiKey=a74d4d252cdc4d42a1a148605716d4ae
const location = ref("");
const wheather = ref("");
const wheatherCondition = ref("");

onMounted(async () => {
  const res = await axios.get(
    "https://api.ipgeolocation.io/ipgeo?apiKey=a74d4d252cdc4d42a1a148605716d4ae"
  );
  location.value = res.data.city;

  const res2 = await axios.get(
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Sofia?unitGroup=metric&key=WDY782VLJDBXMN68ZPT3MXYNS&contentType=json"
  );

  wheather.value = res2.data.currentConditions.temp;
  wheatherCondition.value = res2.data.currentConditions.conditions;
});
</script>

<template>
  <div class="relative py-3 px-6">
    <div
      class="z-[5] absolute top-0 left-0 w-full h-full bg-black opacity-50"
    ></div>
    <img
      class="absolute top-0 left-0 w-full h-full object-cover"
      src="../assets/car.jpg"
    />
    <div class="relative z-10 text-white">
      <h1 class="text-[40px] font-bold italic">Hello Jesus</h1>
      <p class="text-2xl -mt-2">{{ date }}</p>
      <p class="text-xl mt-7">
        {{ location }}, <span>{{ wheather }}<sup>°C</sup></span>
        {{ wheatherCondition }}
      </p>
    </div>
  </div>
</template>
