// Background service worker for Tab Recorder extension

let recordingTabs = new Set();
let consoleLogs = []; // Store logs in memory for better performance
let networkLogs = []; // Store network logs in memory

// Runs when the extension is first installed
chrome.runtime.onInstalled.addListener(function() {
    // Initialize storage
    chrome.storage.local.set({
        isRecording: false,
        consoleLogs: [],
        networkLogs: []
    });
});

// Main message handler - receives messages from popup and content scripts
// This is the central communication hub for the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Background: Received message:', request.action, request);

    switch (request.action) {
        case 'recordingStarted':
            handleRecordingStarted(request.tabId, request.url);
            break;
            
        case 'recordingStopped':
            handleRecordingStopped(request.tabId);
            break;
            
        case 'consoleLog':
            console.log('Background: Processing consoleLog message');
            handleConsoleLog(request.log);
            break;
            
        case 'networkLog':
            console.log('Background: Processing networkLog message');
            handleNetworkLog(request.log);
            break;
            
        case 'getRecordingStatus':
            sendResponse({ isRecording: recordingTabs.has(request.tabId) });
            break;
            
        case 'getLogs':
            sendResponse({ consoleLogs: consoleLogs, networkLogs: networkLogs });
            break;
            
        case 'clearLogs':
            consoleLogs = [];
            networkLogs = [];
            chrome.storage.local.set({ consoleLogs: [], networkLogs: [] });
            sendResponse({ status: 'cleared' });
            break;
    }
});

// Called when recording starts on a tab
// Sets up the recording state and visual indicators
function handleRecordingStarted(tabId, url) {
    recordingTabs.add(tabId);
    
    // Clear previous logs for this session
    consoleLogs = [];
    networkLogs = [];
    chrome.storage.local.set({
        isRecording: true,
        consoleLogs: [],
        networkLogs: []
    });
    
    // Update badge to show recording status
    chrome.action.setBadgeText({
        text: 'REC',
        tabId: tabId
    });
    
    chrome.action.setBadgeBackgroundColor({
        color: '#ff4757',
        tabId: tabId
    });
}

// Called when recording stops on a tab
// Cleans up the recording state and visual indicators
function handleRecordingStopped(tabId) {
    recordingTabs.delete(tabId);
    
    chrome.storage.local.set({ isRecording: false });
    
    // Clear badge
    chrome.action.setBadgeText({
        text: '',
        tabId: tabId
    });
}

// Stores a console log entry in memory and persistent storage
// This is called every time a console.log/error/warn/etc happens on the page
function handleConsoleLog(log) {
    console.log('Background: Received console log:', log);
    
    // Add to memory array
    consoleLogs.push(log);
    console.log('Background: Added console log, new count:', consoleLogs.length);
    
    // Keep only last 1000 logs to prevent memory overflow
    if (consoleLogs.length > 1000) {
        consoleLogs.splice(0, consoleLogs.length - 1000);
    }
    
    // Also store in chrome.storage.local for persistence
    chrome.storage.local.set({ consoleLogs: consoleLogs }, function() {
        console.log('Background: Stored console logs successfully, total:', consoleLogs.length);
    });
}

// Stores a network log entry in memory and persistent storage
// This is called every time a fetch or XMLHttpRequest happens on the page
function handleNetworkLog(log) {
    console.log('Background: Received network log:', log);
    
    // Add to memory array
    networkLogs.push(log);
    console.log('Background: Added network log, new count:', networkLogs.length);
    
    // Keep only last 500 network logs to prevent memory overflow
    if (networkLogs.length > 500) {
        networkLogs.splice(0, networkLogs.length - 500);
    }
    
    // Also store in chrome.storage.local for persistence
    chrome.storage.local.set({ networkLogs: networkLogs }, function() {
        console.log('Background: Stored network logs successfully, total:', networkLogs.length);
    });
}

// Handles page reloads and navigation
// Re-injects the content script if the page was reloaded while recording
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && recordingTabs.has(tabId)) {
        // Re-inject content script if page was reloaded
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            console.error('Error re-injecting content script:', err);
        });
    }
});

// Handles when a tab is closed
// Cleans up recording state for that tab
chrome.tabs.onRemoved.addListener(function(tabId) {
    if (recordingTabs.has(tabId)) {
        recordingTabs.delete(tabId);
    }
});

// Handles clicks on the extension icon
// Currently not used (popup handles this), but could be used for quick actions
chrome.action.onClicked.addListener(function(tab) {
    // This will be handled by the popup, but we can add quick actions here later
}); 