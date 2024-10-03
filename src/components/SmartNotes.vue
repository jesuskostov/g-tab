<script setup>
import { ref, onMounted, watch } from "vue";

// Local storage key
const NOTES_STORAGE_KEY = "simple_notes";

// Reactive data for the notes
const notes = ref(""); // The raw text content

// Load notes from localStorage on page load
onMounted(() => {
  const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
  if (savedNotes) {
    notes.value = savedNotes;
  }
});

// Watch for changes in notes and save to localStorage
watch(notes, (newVal) => {
  localStorage.setItem(NOTES_STORAGE_KEY, newVal);
});
</script>

<template>
  <div class="h-[85%]">
    <textarea
      v-model="notes"
      class="w-full pt-4 h-full border-none rounded-md bg-white overflow-auto focus:outline-none"
      placeholder="Write your notes here..."
    ></textarea>
  </div>
</template>

<style>
/* Custom styling for textarea */
textarea {
  width: 100%;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
}
</style>
