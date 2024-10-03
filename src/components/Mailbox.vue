<script setup>
import { ref, onMounted } from "vue";

// Reactive variables to store email data and authentication state
const emails = ref([]);
const isAuthenticated = ref(false); // Initially set to `false` to trigger login
const accessToken = ref(null);
const browserHeight = ref(window.innerHeight - 170);

// Function to limit text length for better display
const limitText = (text, maxLength = 50) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Function to send login request to the background script
const login = () => {
  console.log("Logging in...");

  // Send message to background.js to trigger login
  chrome.runtime.sendMessage({ action: "login" }, (response) => {
    console.log(response);

    if (response && response.success) {
      console.log("Login initiated");
      // After successful login, token will be stored and fetched
      checkTokenAndFetchEmails();
    } else {
      console.error("Login failed");
    }
  });
};

// Function to fetch the access token and retrieve unread emails
const checkTokenAndFetchEmails = () => {
  // Retrieve the token from Chrome's local storage
  chrome.storage.local.get("google_access_token", (result) => {
    const token = result.google_access_token;
    if (token) {
      console.log("Token retrieved:", token); // Add more logging here
      accessToken.value = token;
      isAuthenticated.value = true;
      fetchUnreadEmails(); // Fetch emails after token retrieval
    } else {
      console.log("No access token found, please log in.");
      isAuthenticated.value = false;
    }
  });
};

// Function to fetch unread emails from Gmail
const fetchUnreadEmails = async () => {
  if (!accessToken.value) return;

  try {
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread category:primary&labelIds=INBOX&maxResults=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      }
    );

    const result = await response.json();
    const messages = result.messages || [];
    emails.value = []; // Clear old emails

    if (messages.length > 0) {
      for (const message of messages) {
        const messageResponse = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken.value}`,
            },
          }
        );

        const msgResult = await messageResponse.json();
        const headers = msgResult.payload.headers;

        // Extract email metadata from headers
        const subjectHeader = headers.find(
          (header) => header.name === "Subject"
        );
        const fromHeader = headers.find((header) => header.name === "From");
        const dateHeader = headers.find((header) => header.name === "Date");

        const subject = subjectHeader ? subjectHeader.value : "No Subject";
        const from = fromHeader ? fromHeader.value : "Unknown Sender";
        const date = dateHeader ? dateHeader.value : "Unknown Date";
        const snippet = msgResult.snippet;

        // Construct a direct link to the email
        const emailLink = `https://mail.google.com/mail/u/0/#inbox/${message.id}`;

        // Push the extracted data to the emails array
        emails.value.push({ subject, from, date, snippet, emailLink });
      }
    }
  } catch (error) {
    isAuthenticated.value = false;
    chrome.storage.local.remove("google_access_token");
    console.error("Error fetching emails:", error);
  }
};

// Initialize and check for stored token
onMounted(() => {
  checkTokenAndFetchEmails(); // Check if token is already stored
});
</script>
<template>
  <div>
    <div
      v-if="!isAuthenticated"
      class="flex justify-center items-center"
      :style="`height: ${browserHeight}px`"
    >
      <button
        @click="login"
        class="bg-black text-white px-4 py-3 rounded cursor-pointer"
      >
        Sign In with Google
      </button>
    </div>

    <div class="relative" v-else>
      <span class="custom-shadow absolute -bottom-2 left-0 w-full"></span>
      <div
        v-if="emails.length > 0"
        class="mt-4 overflow-scroll"
        :style="`height: ${browserHeight}px`"
      >
        <div v-if="emails.length > 0">
          <div
            v-for="(email, index) in emails"
            :key="index"
            class="bg-[#EAF2FA] rounded-2xl p-4 mb-4 flex items-start gap-4"
          >
            <div>
              <div
                class="w-12 h-12 rounded-lg bg-black flex items-center justify-center"
              >
                <a :href="email.emailLink" target="_blank">
                  <svg
                    fill="#fff"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    width="26px"
                    height="26px"
                    viewBox="0 0 512 512"
                    xml:space="preserve"
                  >
                    <g id="7935ec95c421cee6d86eb22ecd12600d">
                      <path
                        style="display: inline"
                        d="M170.591,239.406L1.584,429.263c-0.433-1.911-1.084-3.759-1.084-5.852V88.589
		c0-2.541,0.71-4.837,1.356-7.144L170.591,239.406z M493.987,65.524c-1.238-0.277-2.424-0.876-3.79-0.876H21.819
		c-1.297,0-2.456,0.599-3.769,0.876l237.961,222.734L493.987,65.524z M262.808,313.021c-1.954,1.869-4.372,2.777-6.797,2.777
		c-2.419,0-4.842-0.908-6.775-2.777l-62.21-58.217L16.656,446.145c1.698,0.523,3.364,1.207,5.163,1.207h468.378
		c1.89,0,3.534-0.684,5.243-1.207L325.082,254.804L262.808,313.021z M341.494,239.406l168.98,189.836
		c0.459-1.911,1.025-3.759,1.025-5.831V88.589c0-2.499-0.62-4.837-1.26-7.133L341.494,239.406z"
                      ></path>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold mb-1">
                <a :href="email.emailLink" target="_blank">{{
                  limitText(email.subject)
                }}</a>
              </h3>
              <p class="text-xs text-gray-700">
                {{ limitText(email.snippet) }}
              </p>
              <p class="mt-1 text-xs text-gray-500 font-normal">
                {{ email.date }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex justify-center h-full items-center" v-else>
          <div class="loader"></div>
        </div>
      </div>
      <div v-else>
        <div
          class="flex justify-center items-center"
          :style="`height: ${browserHeight}px`"
        >
          <div class="text-center">
            <h2 class="text-2xl font-bold">No new emails</h2>
            <p class="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
