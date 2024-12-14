// Loading state management
function setLoading(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.textContent = 'Loading...';
    } else {
        element.classList.remove('loading');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const codeDisplay = document.getElementById('code-display');
    const analysisDisplay = document.getElementById('analysis-display');
    
    try {
        const data = await chrome.storage.local.get('leetcode_data');
        console.log("Data from storage:", data);
        if (data.leetcode_data && data.leetcode_data.code) {
            codeDisplay.textContent = data.leetcode_data.code;
            // Initial analysis when popup opens with existing code
            await performAnalysis(data.leetcode_data.code, analysisDisplay);
        } else {
            codeDisplay.textContent = 'No submission data available yet...';
            analysisDisplay.textContent = 'Waiting for code submission...';
        }
    } catch (error) {
        console.error('Error reading from storage:', error);
        codeDisplay.textContent = 'Error loading data';
        analysisDisplay.textContent = `Error: ${error.message}`;
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener(async (changes, namespace) => {
        if (namespace === 'local' && changes.leetcode_data) {
            const newData = changes.leetcode_data.newValue;
            if (newData && newData.code) {
                codeDisplay.textContent = newData.code;
                await performAnalysis(newData.code, analysisDisplay);
            }
        }
    });
});

async function performAnalysis(code, analysisDisplay) {
    try {
        setLoading(analysisDisplay, true);
        
        // Simple request body
        const requestBody = {
            messages: [
                {
                    role: 'user',
                    content: `Analyze this code's time and space complexity: \n\n${code}`
                }
            ],
            model: 'grok-beta'  // Make sure this is the correct model name
        };

        // Simple headers
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getApiKey()}`
        };

        // Log the request for debugging
        console.log('Request:', {
            url: 'https://api.x.ai/v1/chat/completions',
            body: requestBody,
            headers: { ...headers, Authorization: 'HIDDEN' }
        });

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        // If not OK, get the error message from response
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                `API request failed (${response.status}): ${
                    errorData ? JSON.stringify(errorData) : response.statusText
                }`
            );
        }

        const data = await response.json();
        console.log('API Response:', data);  // Log the response for debugging

        // Simplified response handling
        if (data.choices?.[0]?.message?.content) {
            setLoading(analysisDisplay, false);
            analysisDisplay.textContent = data.choices[0].message.content;
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Full error details:', error);
        setLoading(analysisDisplay, false);
        analysisDisplay.textContent = 'Analysis failed. Please check the console for details.';
    }
}

// Helper function to get API key from storage or environment
async function getApiKey() {
    try {
        const data = await chrome.storage.local.get('api_key');
        const apiKey = data.api_key;
        
        if (!apiKey) {
            throw new Error('API key not found in storage');
        }

        // Basic validation of API key format
        if (!apiKey.startsWith('xai-')) {
            throw new Error('Invalid API key format');
        }

        return apiKey;
    } catch (error) {
        console.error('API Key Error:', error);
        throw new Error('API key error: ' + error.message);
    }
}