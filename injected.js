// Injected script for Tab Recorder - console override logic
// This script runs in the page context, not the content script context
// It overrides the console methods to capture all console.log/error/warn/etc calls
// It also overrides fetch and XMLHttpRequest to capture network requests

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

    // Override fetch to capture network requests
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, config] = args;
        const method = (config?.method || 'GET').toUpperCase();
        const requestTime = new Date().toISOString();

        try {
            const response = await originalFetch(...args);
            const clone = response.clone();

            clone.text().then(body => {
                window.postMessage({
                    source: 'tab-recorder',
                    type: 'networkLog',
                    transport: 'fetch',
                    method,
                    url,
                    status: response.status,
                    requestTime,
                    responseTime: new Date().toISOString(),
                    responseBody: body,
                    headers: Object.fromEntries(response.headers.entries())
                }, '*');
            });

            return response;
        } catch (error) {
            window.postMessage({
                source: 'tab-recorder',
                type: 'networkLog',
                transport: 'fetch',
                method,
                url,
                status: 'error',
                requestTime,
                responseTime: new Date().toISOString(),
                responseBody: error.message
            }, '*');
            throw error;
        }
    };

    // Override XMLHttpRequest to capture network requests
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._method = method;
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(body) {
        const start = Date.now();
        const xhr = this;

        xhr.addEventListener('loadend', function() {
            window.postMessage({
                source: 'tab-recorder',
                type: 'networkLog',
                transport: 'xhr',
                method: xhr._method,
                url: xhr._url,
                status: xhr.status,
                requestTime: new Date(start).toISOString(),
                responseTime: new Date().toISOString(),
                responseBody: xhr.responseText,
                headers: xhr.getAllResponseHeaders()
            }, '*');
        });

        return originalSend.apply(this, arguments);
    };

    // Log that injection was successful
    console.log('Tab Recorder: Console override injected successfully');
    console.log('Tab Recorder: Network interception (fetch & XHR) initialized');
})(); 