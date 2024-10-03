<script setup>
import { ref } from "vue";
import Card from "./components/Card.vue";
import Server from "./components/Server.vue";
import Mailbox from "./components/Mailbox.vue";
import TodoWithCalendar from "./components/TodoWithCalendar.vue";
import GalleryWithWeather from "./components/GalleryWithWeather.vue";
import SmartNotes from "./components/SmartNotes.vue";

const browserHeight = ref(window.innerHeight - 70);
const browserWidth = ref(window.innerWidth * 0.9);
</script>

<template>
  <div
    :style="`height: ${browserHeight}px; width: ${browserWidth}px`"
    class="mx-auto"
  >
    <div class="grid grid-cols-3 gap-10 h-full">
      <div class="flex flex-col gap-6">
        <Card :padding="false">
          <GalleryWithWeather />
        </Card>
        <Card transparent>
          <h2 class="text-2xl font-bold">Server Status - UP</h2>
          <Server />
        </Card>
        <Card class="grow">
          <h2 class="text-2xl font-bold">Smart Notes</h2>
          <SmartNotes />
        </Card>
      </div>
      <div class="flex flex-col gap-6">
        <TodoWithCalendar />
      </div>
      <div class="flex flex-col gap-6">
        <Card>
          <h2 class="text-2xl font-bold">MailBox</h2>
          <Mailbox />
        </Card>
      </div>
    </div>
  </div>
</template>
