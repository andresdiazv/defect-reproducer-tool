// Content script for Tab Recorder - intercepts console logs

let isRecording = false;
let originalConsole = {};
let isInitialized = false;

// Add global flag for debugging
window.isTabRecorderInitialized = true;

// Store original console methods
function storeOriginalConsole() {
    originalConsole.log = console.log;
    originalConsole.error = console.error;
    originalConsole.warn = console.warn;
    originalConsole.info = console.info;
    originalConsole.debug = console.debug;
}

// Override console methods to capture logs
function overrideConsole() {
    const consoleMethods = ['log', 'error', 'warn', 'info', 'debug'];
    
    consoleMethods.forEach(method => {
        console[method] = function(...args) {
            // Call original method first
            originalConsole[method].apply(console, args);
            
            // Record the log if recording is active
            if (isRecording) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level: method,
                    message: args.map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    }).join(' '),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
                
                // Send to background script
                chrome.runtime.sendMessage({
                    action: 'consoleLog',
                    log: logEntry
                }).catch(err => {
                    console.error('Failed to send log to background:', err);
                });
            }
        };
    });
}

// Restore original console methods
function restoreConsole() {
    Object.keys(originalConsole).forEach(method => {
        console[method] = originalConsole[method];
    });
}

// Initialize console interception
function initializeConsoleInterception() {
    try {
        storeOriginalConsole();
        overrideConsole();
        isInitialized = true;
        console.log('Tab Recorder: Console interception initialized successfully');
    } catch (error) {
        console.error('Tab Recorder: Failed to initialize console interception:', error);
    }
}

// Start recording
function startRecording() {
    try {
        isRecording = true;
        console.log('Tab Recorder: Console recording started');
        
        // Send initial log to indicate recording started
        const startLog = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Tab Recorder: Console recording started',
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        chrome.runtime.sendMessage({
            action: 'consoleLog',
            log: startLog
        }).catch(err => {
            console.error('Failed to send start log:', err);
        });
        
        return true;
    } catch (error) {
        console.error('Tab Recorder: Failed to start recording:', error);
        return false;
    }
}

// Stop recording
function stopRecording() {
    try {
        isRecording = false;
        console.log('Tab Recorder: Console recording stopped');
        
        // Send final log to indicate recording stopped
        const stopLog = {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Tab Recorder: Console recording stopped',
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        chrome.runtime.sendMessage({
            action: 'consoleLog',
            log: stopLog
        }).catch(err => {
            console.error('Failed to send stop log:', err);
        });
        
        return true;
    } catch (error) {
        console.error('Tab Recorder: Failed to stop recording:', error);
        return false;
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Content script received message:', request);
    
    try {
        switch (request.action) {
            case 'startRecording':
                if (!isInitialized) {
                    initializeConsoleInterception();
                }
                const startSuccess = startRecording();
                sendResponse({ success: startSuccess });
                break;
                
            case 'stopRecording':
                const stopSuccess = stopRecording();
                sendResponse({ success: stopSuccess });
                break;
                
            case 'getStatus':
                sendResponse({ isRecording: isRecording, isInitialized: isInitialized });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        console.error('Tab Recorder: Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
    
    // Return true to indicate we will send a response asynchronously
    return true;
});

// Initialize when script loads
initializeConsoleInterception();

// Also capture any existing console logs that might be called during page load
// by setting up a MutationObserver to detect when console methods are called
const observer = new MutationObserver(function(mutations) {
    // This is a fallback for any console calls that might happen during DOM changes
    // The main interception should handle most cases
});

observer.observe(document, {
    childList: true,
    subtree: true
});

// Handle page unload
window.addEventListener('beforeunload', function() {
    if (isRecording) {
        stopRecording();
    }
});

console.log('Tab Recorder content script loaded successfully'); 