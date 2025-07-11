// Background service worker for Tab Recorder extension

let recordingTabs = new Set();

chrome.runtime.onInstalled.addListener(function() {
    // Initialize storage
    chrome.storage.local.set({
        isRecording: false,
        consoleLogs: []
    });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    switch (request.action) {
        case 'recordingStarted':
            handleRecordingStarted(request.tabId, request.url);
            break;
            
        case 'recordingStopped':
            handleRecordingStopped(request.tabId);
            break;
            
        case 'consoleLog':
            handleConsoleLog(request.log);
            break;
            
        case 'getRecordingStatus':
            sendResponse({ isRecording: recordingTabs.has(request.tabId) });
            break;
    }
});

function handleRecordingStarted(tabId, url) {
    recordingTabs.add(tabId);
    
    // Clear previous logs for this session
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
    chrome.storage.local.get(['consoleLogs'], function(result) {
        const logs = result.consoleLogs || [];
        logs.push(log);
        
        // Keep only last 1000 logs to prevent storage overflow
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        chrome.storage.local.set({ consoleLogs: logs });
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