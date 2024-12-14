document.addEventListener('DOMContentLoaded', async () => {
    // Load saved API key
    const data = await chrome.storage.local.get('api_key');
    if (data.api_key) {
        document.getElementById('apiKey').value = data.api_key;
    }

    // Save API key when button is clicked
    document.getElementById('save').addEventListener('click', async () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const status = document.getElementById('status');
        
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }
            if (!apiKey.startsWith('xai-')) {
                throw new Error('Invalid API key format');
            }

            await chrome.storage.local.set({ api_key: apiKey });
            
            status.textContent = 'Settings saved successfully!';
            status.className = 'success';
        } catch (error) {
            status.textContent = `Error: ${error.message}`;
            status.className = 'error';
        }
        
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    });
}); 