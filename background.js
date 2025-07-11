// Background service worker for Tab Recorder extension

let recordingTabs = new Set();
let consoleLogs = []; // Store logs in memory for better performance

chrome.runtime.onInstalled.addListener(function() {
    // Initialize storage
    chrome.storage.local.set({
        isRecording: false,
        consoleLogs: []
    });
});

// Handle messages from popup and content scripts
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
            
        case 'getRecordingStatus':
            sendResponse({ isRecording: recordingTabs.has(request.tabId) });
            break;
            
        case 'getLogs':
            sendResponse({ logs: consoleLogs });
            break;
            
        case 'clearLogs':
            consoleLogs = [];
            chrome.storage.local.set({ consoleLogs: [] });
            sendResponse({ status: 'cleared' });
            break;
    }
});

function handleRecordingStarted(tabId, url) {
    recordingTabs.add(tabId);
    
    // Clear previous logs for this session
    consoleLogs = [];
    chrome.storage.local.set({
        isRecording: true,
        consoleLogs: []
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

function handleRecordingStopped(tabId) {
    recordingTabs.delete(tabId);
    
    chrome.storage.local.set({ isRecording: false });
    
    // Clear badge
    chrome.action.setBadgeText({
        text: '',
        tabId: tabId
    });
}

function handleConsoleLog(log) {
    console.log('Background: Received console log:', log);
    
    // Add to memory array
    consoleLogs.push(log);
    console.log('Background: Added log, new count:', consoleLogs.length);
    
    // Keep only last 1000 logs to prevent memory overflow
    if (consoleLogs.length > 1000) {
        consoleLogs.splice(0, consoleLogs.length - 1000);
    }
    
    // Also store in chrome.storage.local for persistence
    chrome.storage.local.set({ consoleLogs: consoleLogs }, function() {
        console.log('Background: Stored logs successfully, total:', consoleLogs.length);
    });
}

// Handle tab updates to manage recording state
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

// Handle tab removal
chrome.tabs.onRemoved.addListener(function(tabId) {
    if (recordingTabs.has(tabId)) {
        recordingTabs.delete(tabId);
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
    // This will be handled by the popup, but we can add quick actions here later
}); 