chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
});

// Function to handle login via Chrome Identity API
function loginWithGoogle() {
    // Use the Chrome Identity API to get an OAuth token
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError) {
            console.error("Error getting token:", chrome.runtime.lastError.message);
            return;
        }

        console.log("OAuth Success, Access Token:", token);

        // Store the token in Chrome's local storage for later use
        chrome.storage.local.set({ google_access_token: token }, () => {
            console.log("Token successfully stored in local storage");
        });
    });
}

// Listen for login messages from the Vue component
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);

    if (message.action === "login") {
        loginWithGoogle();
        sendResponse({ success: true });
    }
});
