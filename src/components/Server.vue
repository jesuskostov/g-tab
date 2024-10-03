<script setup>
import { ref, onMounted } from "vue";
// SERVER MONITORING DATA
const cpuUsage = ref(0);
const ramUsage = ref(0);
const storageUsage = ref(0);
const cpu_temp = ref(0);

const fetchServerStatus = async () => {
  try {
    // Fetch CPU, RAM, and Storage data from your server's API
    const cpuResponse = await fetch("https://monitoring.g-home.site/api/cpu");
    const cpuData = await cpuResponse.json();
    cpuUsage.value = cpuData.cpu_usage;

    const ramResponse = await fetch("https://monitoring.g-home.site/api/ram");
    const ramData = await ramResponse.json();
    ramUsage.value = ramData.ram_percentage;

    const storageResponse = await fetch(
      "https://monitoring.g-home.site/api/storage"
    );
    const storageData = await storageResponse.json();
    storageUsage.value = storageData.storage_percentage;

    const cpuTempResponse = await fetch(
      "https://monitoring.g-home.site/api/cpu_temperature"
    );
    const cpuTempData = await cpuTempResponse.json();
    cpu_temp.value = cpuTempData.cpu_temperature;
  } catch (error) {
    console.error("Error fetching server data:", error);
  }
};

onMounted(() => {
  fetchServerStatus();
  setInterval(fetchServerStatus, 10000);
});
</script>
<template>
  <!-- Storage Progress Bar -->
  <div class="mt-4">
    <div class="flex justify-between mb-2">
      <h2>Storage</h2>
      <p class="text-sm">{{ storageUsage }}% Used</p>
    </div>
    <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        class="bg-black/60 h-2 rounded-full"
        :style="{ width: storageUsage + '%' }"
      ></div>
    </div>
  </div>

  <!-- RAM Progress Bar -->
  <div class="mt-4">
    <div class="flex justify-between mb-2">
      <h2>RAM</h2>
      <p class="text-sm">{{ ramUsage }}% Used</p>
    </div>
    <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        class="bg-black/60 h-2 rounded-full"
        :style="{ width: ramUsage + '%' }"
      ></div>
    </div>
  </div>

  <!-- CPU Progress Bar -->
  <div class="mt-4">
    <div class="flex justify-between mb-2">
      <h2>CPU</h2>
      <p class="text-sm">{{ cpuUsage }}% Used</p>
    </div>
    <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        class="bg-black/60 h-2 rounded-full"
        :style="{ width: cpuUsage + '%' }"
      ></div>
    </div>
  </div>

  <!-- CPU Temp -->
  <div class="mt-4">
    <div class="flex justify-between mb-2">
      <h2>CPU Temperature</h2>
      <p class="text-sm">{{ cpu_temp }}°C</p>
    </div>
    <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
      <div
        class="bg-black/60 h-2 rounded-full"
        :style="{ width: cpu_temp + '%' }"
      ></div>
    </div>
  </div>
</template>
