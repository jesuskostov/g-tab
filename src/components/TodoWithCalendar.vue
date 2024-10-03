<script setup>
import { ref, onMounted } from "vue";
import VueCal from "vue-cal";
import Card from "./Card.vue";
import "vue-cal/dist/vuecal.css"; // Import calendar style

// Local storage key
const LOCAL_STORAGE_KEY = "tasks";

// Reactive data
const selectedDate = ref(new Date()); // Store selected date from calendar
const tasksForSelectedDate = ref([]); // Store tasks for the current selected date (for the to-do list)
const newTask = ref(""); // Model for adding a new task
const allTasks = ref([]); // Store all tasks (for the calendar)

// Tasks stored in localStorage or fallback to an empty object
const predefinedTasks = ref(
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {}
);

// Utility function to format the date as YYYY-MM-DD while keeping local time zone
const formatDate = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// Function to save tasks to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(predefinedTasks.value)
  );
};

// Function to handle date selection from calendar
const onDateSelect = (day) => {
  const selected = formatDate(day); // Format the selected date
  selectedDate.value = selected; // Set the selected date

  // Load tasks for the selected date
  loadTasksForSelectedDate();
};

// Load tasks for the selected date from predefinedTasks
const loadTasksForSelectedDate = () => {
  // Ensure tasks are loaded for the correct selected date
  tasksForSelectedDate.value =
    predefinedTasks.value[formatDateForTodo(selectedDate.value)]?.map(
      (task) => ({
        id: task.id,
        title: task.title,
        start: task.start,
        end: task.end,
        isCompleted: task.isCompleted || false, // Handle task completion state
      })
    ) || [];
};

// Load all tasks for the calendar
const loadAllTasksForCalendar = () => {
  // Flatten all tasks across all dates into `allTasks`
  allTasks.value = Object.entries(predefinedTasks.value).flatMap(
    ([date, tasks]) =>
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        start: task.start,
        end: task.end,
        isCompleted: task.isCompleted || false, // Handle task completion state
      }))
  );
};

// Add new task for the selected date
const addTask = () => {
  if (!newTask.value || !selectedDate.value) return;

  const newTaskEntry = {
    id: Date.now(), // Unique ID
    title: newTask.value,
    start: `${selectedDate.value} 10:00`, // Default start time
    end: `${selectedDate.value} 11:00`, // Default end time
    isCompleted: false, // Default task is not completed
  };

  // Check if tasks already exist for selected date, otherwise initialize an empty array
  if (!predefinedTasks.value[selectedDate.value]) {
    predefinedTasks.value[selectedDate.value] = [];
  }

  // Add the new task to the selected date
  predefinedTasks.value[selectedDate.value].push(newTaskEntry);

  // Save the updated tasks to local storage
  saveToLocalStorage();

  // Reload all tasks and tasks for the selected date after adding
  loadAllTasksForCalendar();
  loadTasksForSelectedDate();

  // Clear input field
  newTask.value = "";
};

// Toggle task completion
const toggleTaskCompletion = (taskId) => {
  const taskDate = formatDateForTodo(selectedDate.value);
  const taskIndex = predefinedTasks.value[taskDate].findIndex(
    (task) => task.id === taskId
  );
  if (taskIndex !== -1) {
    predefinedTasks.value[taskDate][taskIndex].isCompleted =
      !predefinedTasks.value[taskDate][taskIndex].isCompleted; // Toggle completion state
    saveToLocalStorage(); // Save updated state to local storage
    loadTasksForSelectedDate(); // Reload tasks
  }
};

// Remove task
const removeTask = (taskId) => {
  const taskDate = formatDateForTodo(selectedDate.value);
  predefinedTasks.value[taskDate] = predefinedTasks.value[taskDate].filter(
    (task) => task.id !== taskId
  );
  saveToLocalStorage(); // Save updated state to local storage
  loadTasksForSelectedDate(); // Reload tasks
  loadAllTasksForCalendar();
};

// formatDate to DD/MM/YYYY
const formatDateForTodo = (date) => {
  const d = new Date(date);
  let day = "" + d.getDate();
  let month = "" + (d.getMonth() + 1);
  const year = d.getFullYear();

  if (day.length < 2) day = "0" + day;
  if (month.length < 2) month = "0" + month;

  return [year, month, day].join("-");
};

const todoBox = ref(null);
const todoBoxHeight = ref(0);

// Load tasks from local storage on page load
onMounted(() => {
  loadAllTasksForCalendar(); // Load all tasks for the calendar on page load
  loadTasksForSelectedDate(); // Load tasks for the selected date on page load
  setTimeout(() => {
    todoBoxHeight.value = todoBox.value.clientHeight - 130;
  }, 500);
});
</script>

<template>
  <div class="relative flex flex-col items-center h-full">
    <!-- Calendar Component -->
    <div class="w-full h-1/2">
      <VueCal
        :selected-date="new Date()"
        @cell-click="onDateSelect"
        class="vuecal"
        xsmall
        hide-view-selector
        events-count-on-year-view
        :active-view="'month'"
        :events="allTasks"
        hide-title
        style="height: 100%"
      />
    </div>

    <div ref="todoBox" class="absolute -bottom-[35px] w-full h-[50%]">
      <Card class="rounded-bl-none rounded-br-none h-full">
        <!-- Add New Task -->
        <h2 class="text-sm font-bold -mt-4 text-center">
          {{ formatDateForTodo(selectedDate) || "No Date Selected" }}
        </h2>
        <div class="relative mt-4 mb-6">
          <input
            v-model="newTask"
            placeholder="Какво забравяме?"
            class="border text-sm border-gray-300 py-3 px-4 rounded-full bg-[#EAF2FA] w-full"
            @keydown.enter="addTask"
          />
          <span class="absolute top-[12px] right-5 text-gray-400 text-lg"
            >↵</span
          >
        </div>
        <!-- Task Management Block -->
        <div class="w-full mt-10">
          <!-- Task List for the selected date -->
          <ul
            v-if="tasksForSelectedDate.length"
            class="space-y-3 overflow-scroll -mx-6 px-6"
            :style="`height: ${todoBoxHeight}px`"
          >
            <li
              v-for="task in tasksForSelectedDate"
              :key="task.id"
              class="w-full bg-[#EAF2FA] pl-3 pr-4 py-3 rounded-2xl flex justify-between items-center"
              @click="toggleTaskCompletion(task.id)"
            >
              <!-- Checkbox for completion -->
              <input
                type="checkbox"
                class="mr-3 custom-checkbox"
                v-model="task.isCompleted"
                @change="toggleTaskCompletion(task.id)"
              />
              <span
                :class="{
                  'line-through text-gray-500': task.isCompleted,
                  'text-black': !task.isCompleted,
                }"
                class="flex-1"
              >
                {{ task.title }}
              </span>
              <!-- Remove button -->
              <button
                @click="removeTask(task.id)"
                class="text-red-500 hover:text-red-700"
              >
                ✖
              </button>
            </li>
          </ul>
          <p v-else class="text-gray-500 text-center">
            No tasks for this date.
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<style>
/* Custom styles for better layout */

.vuecal__title-bar {
  background-color: #000 !important;
  color: #fff;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.vuecal {
  background-color: white;
  border-radius: 28px;
}

/* Cell background indicator */
.vuecal__cell--has-events {
  background-color: #eaf2fa;
}

/* Custom checkbox styling */
.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  appearance: none;
  outline: none;
  cursor: pointer;
  background-color: #c8c8c8;

  position: relative;
}

.custom-checkbox:checked {
  background-color: black;
  border-color: black;
}

.custom-checkbox:checked::before {
  content: "✓";
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
