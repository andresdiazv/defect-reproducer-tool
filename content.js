// Content script for Tab Recorder - intercepts console logs

// Prevent duplicate script injection
if (window.tabRecorderInitialized) {
    console.log('Tab Recorder: Already initialized, skipping duplicate injection');
    // Still respond to messages even if already initialized
} else {
    window.tabRecorderInitialized = true;
    
    let isRecording = false;
    let isInitialized = false;

    // Add global flag for debugging
    window.isTabRecorderInitialized = true;

    // Sends a log entry to the background script for storage
    function sendLogToBackground(logEntry) {
        if (chrome && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: 'consoleLog',
                log: logEntry
            }).catch(err => {
                console.error('Failed to send log to background:', err);
            });
        }
    }

    // Listens for messages from the injected script (console overrides)
    // When a console.log/error/warn/etc happens on the page, the injected script
    // sends a message here, and we forward it to the background script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data && event.data.source === 'tab-recorder') {
            if (isRecording) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level: event.data.level,
                    message: event.data.message,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
                sendLogToBackground(logEntry);
            }
        }
    });

    // Injects the console override script into the page
    // This script will intercept all console.log/error/warn/etc calls
    function initializeConsoleInterception() {
        try {
            // Check if already injected
            if (window.__tabRecorderInjected) {
                console.log('Tab Recorder: Console override already injected, skipping');
                isInitialized = true;
                return;
            }
            
            // Create a script element to inject the console override
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('injected.js');
            script.onload = function() {
                console.log('Tab Recorder: Console override injected successfully');
                isInitialized = true;
            };
            script.onerror = function() {
                console.error('Tab Recorder: Failed to load injected script');
            };
            (document.head || document.documentElement).appendChild(script);
        } catch (error) {
            console.error('Tab Recorder: Failed to initialize console interception:', error);
        }
    }

    // Starts recording console logs
    // Sets the flag and sends a start message to background script
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
            
            sendLogToBackground(startLog);
            
            return true;
        } catch (error) {
            console.error('Tab Recorder: Failed to start recording:', error);
            return false;
        }
    }

    // Stops recording console logs
    // Sets the flag and sends a stop message to background script
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
            
            sendLogToBackground(stopLog);
            
            return true;
        } catch (error) {
            console.error('Tab Recorder: Failed to stop recording:', error);
            return false;
        }
    }

    // Listens for messages from the popup (start/stop recording commands)
    // This is how the popup communicates with the content script
    if (chrome && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
            console.log('Content script received message:', request);
            
            try {
                switch (request.action) {
                    case 'startRecording':
                        if (!isInitialized) {
                            console.log('Tab Recorder: Initializing console interception before starting recording');
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
                        console.log('Tab Recorder: Status requested - isRecording:', isRecording, 'isInitialized:', isInitialized);
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
        
        console.log('Tab Recorder: Message listener registered successfully');
    } else {
        console.error('Tab Recorder: Chrome runtime not available');
    }

    // Initialize console interception after message listener is registered
    // Use a small delay to ensure everything is set up
    setTimeout(() => {
        initializeConsoleInterception();
    }, 50);

    // Clean up when page is unloaded
    window.addEventListener('beforeunload', function() {
        if (isRecording) {
            stopRecording();
        }
    });

    console.log('Tab Recorder content script loaded successfully');
} 