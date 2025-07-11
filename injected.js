// Injected script for Tab Recorder - console override logic
// This script runs in the page context, not the content script context

(function() {
    'use strict';
    
    // Prevent duplicate injection
    if (window.__tabRecorderInjected) {
        console.log('Tab Recorder: Console override already injected, skipping duplicate');
        return;
    }
    
    // Set global flag to prevent duplicate injection
    window.__tabRecorderInjected = true;
    
    // Store original console methods
    const originalLog = console.log.bind(console);
    const originalError = console.error.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalInfo = console.info.bind(console);
    const originalDebug = console.debug.bind(console);

    // Function to send log via postMessage
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

    // Override console.log
    console.log = function(...args) {
        originalLog(...args);
        sendLog('log', args);
    };

    // Override console.error
    console.error = function(...args) {
        originalError(...args);
        sendLog('error', args);
    };

    // Override console.warn
    console.warn = function(...args) {
        originalWarn(...args);
        sendLog('warn', args);
    };

    // Override console.info
    console.info = function(...args) {
        originalInfo(...args);
        sendLog('info', args);
    };

    // Override console.debug
    console.debug = function(...args) {
        originalDebug(...args);
        sendLog('debug', args);
    };

    // Log that injection was successful
    console.log('Tab Recorder: Console override injected successfully');
})(); 