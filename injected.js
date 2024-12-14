console.log("Script Injected");

(function() {
    // Monitor fetch requests
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
        const [url] = args;
        console.log('Fetch URL:', url);
        
        const response = await originalFetch.apply(this, args);
        
        if (url && url.includes('submissions/latest')) {
            try {
                const clonedResponse = response.clone();
                const data = await clonedResponse.json();
                console.log("Response data:", data);
                
                if (data && data.code) {
                    document.dispatchEvent(new CustomEvent('LastSubmission', {
                        detail: {
                            code: data.code,
                            timestamp: new Date().toISOString()
                        }
                    }));
                    console.log("Code received and sent to content");
                }
            } catch (e) {
                console.error('Error processing fetch response:', e);
            }
        }
        
        return response;
    };
})();