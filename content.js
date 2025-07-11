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

    // Function to send log to background
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

    // Listen for messages from the injected script
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data && event.data.source === 'tab-recorder') {
            // Temporary debugging to see what's happening
            console.log('Tab Recorder: Received message with level:', event.data.level, 'isRecording:', isRecording);
            
            if (isRecording) {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    level: event.data.level,
                    message: event.data.message,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };
                console.log('Tab Recorder: Forwarding log to background:', logEntry);
                sendLogToBackground(logEntry);
            } else {
                console.log('Tab Recorder: Not recording, ignoring log');
            }
        }
    });

    // Initialize console interception - simplified without chrome.tabs.query
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
            
            sendLogToBackground(startLog);
            
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
            
            sendLogToBackground(stopLog);
            
            return true;
        } catch (error) {
            console.error('Tab Recorder: Failed to stop recording:', error);
            return false;
        }
    }

    // Listen for messages from popup - register this FIRST
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

    // Handle page unload
    window.addEventListener('beforeunload', function() {
        if (isRecording) {
            stopRecording();
        }
    });

    console.log('Tab Recorder content script loaded successfully');
} 