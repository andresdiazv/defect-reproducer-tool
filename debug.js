// Debug script for Tab Recorder extension
// Run this in the browser console to check extension status

function debugTabRecorder() {
    console.log('=== Tab Recorder Debug ===');
    
    // Check if extension is loaded
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.log('✅ Chrome extension API available');
        
        // Check if our content script is running
        if (window.isTabRecorderInitialized) {
            console.log('✅ Tab Recorder content script is running');
        } else {
            console.log('❌ Tab Recorder content script not detected');
        }
        
        // Try to send a test message
        chrome.runtime.sendMessage({
            action: 'getStatus'
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('❌ Error communicating with background script:', chrome.runtime.lastError);
            } else {
                console.log('✅ Background script communication successful');
            }
        });
        
    } else {
        console.log('❌ Chrome extension API not available');
    }
    
    // Check console override
    const originalLog = console.log;
    console.log('Test message to check if console is overridden');
    
    // Check if console.log was called (this will show in the actual console)
    console.log('If you see this message, console.log is working normally');
}

// Add a global flag to detect our content script
window.isTabRecorderInitialized = true;

// Run debug function
debugTabRecorder(); 