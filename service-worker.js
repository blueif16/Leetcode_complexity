console.log("Background script loaded");

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'FROM_PAGE') {
//     chrome.storage.local.set({key: request.data});
//     console.log("Received data in background:", request.data);
//   }
// });


// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FROM_PAGE') {
      // Store the data
      chrome.storage.local.set({ 'leetcode_data': message.data }, () => {
        console.log('Data saved to storage:', message.data);
      });
    }
    return true;
  });

chrome.runtime.onInstalled.addListener(async () => {
    // const API_KEY = 'xai-YOUR-ACTUAL-KEY-HERE';  // Replace this with your actual API key
    const API_KEY = chrome.storage.local.get('api_key');
    
    try {
        if (!API_KEY.startsWith('xai-')) {
            throw new Error('Invalid API key format');
        }
        
        await chrome.storage.local.set({ api_key: API_KEY });
        console.log('API key successfully stored');
    } catch (error) {
        console.error('Failed to set API key:', error);
    }
});