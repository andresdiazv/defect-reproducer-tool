document.addEventListener('DOMContentLoaded', function() {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');

    let isRecording = false;
    let hasRecordedData = false;

    // Check current recording status on popup open
    chrome.storage.local.get(['isRecording', 'consoleLogs'], function(result) {
        isRecording = result.isRecording || false;
        hasRecordedData = (result.consoleLogs && result.consoleLogs.length > 0) || false;
        updateUI();
    });

    recordBtn.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
        }
    });

    stopBtn.addEventListener('click', function() {
        if (isRecording) {
            stopRecording();
        }
    });

    exportBtn.addEventListener('click', function() {
        exportData();
    });

    clearBtn.addEventListener('click', function() {
        clearData();
    });

    function startRecording() {
        status.textContent = 'Starting recording...';
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            
            // First, check if content script is already loaded
            chrome.tabs.sendMessage(activeTab.id, {
                action: 'getStatus'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    // Content script not loaded, inject it
                    injectContentScript(activeTab.id, activeTab.url);
                } else {
                    // Content script is loaded, start recording directly
                    startRecordingDirect(activeTab.id, activeTab.url);
                }
            });
        });
    }

    function injectContentScript(tabId, url) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).then(() => {
            console.log('Content script injected successfully');
            
            // Poll for content script readiness
            pollForContentScriptReady(tabId, url);
        }).catch((error) => {
            console.error('Error injecting content script:', error);
            status.textContent = 'Error: Could not inject content script. Please refresh the page.';
        });
    }

    function pollForContentScriptReady(tabId, url, attempts = 0) {
        const maxAttempts = 10; // Try for up to 1 second (10 * 100ms)
        
        console.log(`Tab Recorder: Polling for content script readiness (attempt ${attempts + 1}/${maxAttempts})`);
        
        chrome.tabs.sendMessage(tabId, {
            action: 'getStatus'
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.log('Tab Recorder: Content script not ready yet, retrying...');
                if (attempts < maxAttempts) {
                    // Try again after 100ms
                    setTimeout(() => {
                        pollForContentScriptReady(tabId, url, attempts + 1);
                    }, 100);
                } else {
                    console.error('Content script not ready after maximum attempts');
                    status.textContent = 'Error: Content script not ready. Please refresh the page.';
                }
            } else {
                console.log('Tab Recorder: Content script is ready, starting recording');
                // Content script is ready, start recording
                startRecordingDirect(tabId, url);
            }
        });
    }

    function startRecordingDirect(tabId, url) {
        chrome.tabs.sendMessage(tabId, {
            action: 'startRecording'
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error('Error starting recording:', chrome.runtime.lastError);
                status.textContent = 'Error: Could not start recording. Please refresh the page and try again.';
                return;
            }

            if (response && response.success) {
                isRecording = true;
                hasRecordedData = false; // Reset for new recording
                chrome.storage.local.set({isRecording: true});
                updateUI();
                
                // Send message to background script to track recording
                chrome.runtime.sendMessage({
                    action: 'recordingStarted',
                    tabId: tabId,
                    url: url
                });
            } else {
                status.textContent = 'Error: Recording failed to start';
            }
        });
    }

    function stopRecording() {
        status.textContent = 'Stopping recording...';
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const activeTab = tabs[0];
            
            chrome.tabs.sendMessage(activeTab.id, {
                action: 'stopRecording'
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error stopping recording:', chrome.runtime.lastError);
                    // Even if we can't communicate with content script, stop recording locally
                    isRecording = false;
                    chrome.storage.local.set({isRecording: false});
                    updateUI();
                    status.textContent = 'Recording stopped (with warnings)';
                    return;
                }

                isRecording = false;
                chrome.storage.local.set({isRecording: false});
                
                // Check if we have recorded data
                chrome.runtime.sendMessage({ action: 'getLogs' }, function(response) {
                    hasRecordedData = (response.logs && response.logs.length > 0) || false;
                    updateUI();
                });
                
                // Send message to background script
                chrome.runtime.sendMessage({
                    action: 'recordingStopped',
                    tabId: activeTab.id
                });
            });
        });
    }

    function exportData() {
        // Get logs from background script instead of storage
        chrome.runtime.sendMessage({ action: 'getLogs' }, function(response) {
            const logs = response.logs || [];
            
            console.log('Export: Retrieved logs from background:', logs.length);
            console.log('Export: Log levels found:', [...new Set(logs.map(log => log.level))]);
            
            if (logs.length === 0) {
                status.textContent = 'No data to export';
                return;
            }

            const data = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                consoleLogs: logs
            };

            console.log('Export: Final data to export:', data);

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tab-recorder-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            status.textContent = 'Data exported successfully!';
            setTimeout(() => {
                if (!isRecording) {
                    status.textContent = 'Recording stopped. Data available for export.';
                }
            }, 2000);
        });
    }

    function clearData() {
        chrome.runtime.sendMessage({ action: 'clearLogs' }, function(response) {
            hasRecordedData = false;
            updateUI();
            status.textContent = 'Data cleared successfully!';
            setTimeout(() => {
                status.textContent = 'Ready to record console logs';
            }, 2000);
        });
    }

    function updateUI() {
        if (isRecording) {
            // Recording state
            recordBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            exportBtn.classList.add('hidden');
            clearBtn.classList.add('hidden');
            status.textContent = 'Recording console logs...';
            status.className = 'status recording';
        } else if (hasRecordedData) {
            // Stopped with data available
            recordBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
            exportBtn.classList.remove('hidden');
            clearBtn.classList.remove('hidden');
            status.textContent = 'Recording stopped. Data available for export.';
            status.className = 'status has-data';
        } else {
            // Idle state
            recordBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
            exportBtn.classList.add('hidden');
            clearBtn.classList.add('hidden');
            status.textContent = 'Ready to record console logs';
            status.className = 'status idle';
        }
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'updateStatus') {
            isRecording = request.isRecording;
            updateUI();
        }
    });
}); 