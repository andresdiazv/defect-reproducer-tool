// Injected script for Tab Recorder - console override logic
// This script runs in the page context, not the content script context
// It overrides the console methods to capture all console.log/error/warn/etc calls

(function() {
    'use strict';
    
    // Prevent duplicate injection - only inject once per page
    if (window.__tabRecorderInjected) {
        console.log('Tab Recorder: Console override already injected, skipping duplicate');
        return;
    }
    
    // Set global flag to prevent duplicate injection
    window.__tabRecorderInjected = true;
    
    // Store original console methods so we can still call them
    // This prevents infinite loops when we call console.log inside our override
    const originalLog = console.log.bind(console);
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalInfo = console.info.bind(console);
    const originalDebug = console.debug.bind(console);

    // Sends a log message to the content script via postMessage
    // This is how we communicate from the page context to the extension context
    function sendLog(level, args) {
        // Always send the message - let the content script decide if recording is active
        const message = {
            source: 'tab-recorder',
            level,
            message: args.map(arg => {
                try {
                    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                } catch {
                    return String(arg);
                }
            }).join(' ')
        };
        window.postMessage(message, '*');
    }

    // Override console.log to capture log messages
    // Calls the original console.log AND sends the message to our extension
    console.log = function(...args) {
        originalLog(...args);
        sendLog('log', args);
    };

    // Override console.error to capture error messages
    console.error = function(...args) {
        originalError(...args);
        sendLog('error', args);
    };

    // Override console.warn to capture warning messages
    console.warn = function(...args) {
        originalWarn(...args);
        sendLog('warn', args);
    };

    // Override console.info to capture info messages
    console.info = function(...args) {
        originalInfo(...args);
        sendLog('info', args);
    };

    // Override console.debug to capture debug messages
    console.debug = function(...args) {
        originalDebug(...args);
        sendLog('debug', args);
    };

    // Log that injection was successful
    console.log('Tab Recorder: Console override injected successfully');
})(); 