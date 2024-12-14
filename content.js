// Create and setup the data holder once DOM is ready
const setupDataHolder = () => {
  document.addEventListener('LastSubmission', (e) => {
    const data = e.detail;
    chrome.runtime.sendMessage({ 
      type: 'FROM_PAGE', 
      data: data 
    }).catch(error => console.error('Message sending failed:', error));

    console.log("Sent message to popup: ", data);
  });
};

// Function to inject the XHR interceptor
const injectXHRInterceptor = () => {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  
  // Wait for document.head to be available
  const tryInject = () => {
    if (document.head || document.documentElement) {
      try {
        (document.head || document.documentElement).appendChild(script);
        script.onload = () => {
          script.remove(); // Remove the script tag after injection
          setupDataHolder(); // Set up the event listener after injection
        };
      } catch (error) {
        console.error('Failed to inject script:', error);
      }
    } else {
      // If neither head nor documentElement is available, retry after a short delay
      setTimeout(tryInject, 10);
    }
  };

  tryInject();
};

// Start the injection process when the content script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectXHRInterceptor);
} else {
  injectXHRInterceptor();
}