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
            
            // First, ensure content script is injected
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }).then(() => {
                console.log('Content script injected successfully');
                
                // Wait a moment for script to initialize
                setTimeout(() => {
                    chrome.tabs.sendMessage(activeTab.id, {
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
                                tabId: activeTab.id,
                                url: activeTab.url
                            });
                        } else {
                            status.textContent = 'Error: Recording failed to start';
                        }
                    });
                }, 100);
            }).catch((error) => {
                console.error('Error injecting content script:', error);
                status.textContent = 'Error: Could not inject content script. Please refresh the page.';
            });
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
                chrome.storage.local.get(['consoleLogs'], function(result) {
                    hasRecordedData = (result.consoleLogs && result.consoleLogs.length > 0) || false;
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
        chrome.storage.local.get(['consoleLogs'], function(result) {
            const logs = result.consoleLogs || [];
            
            if (logs.length === 0) {
                status.textContent = 'No data to export';
                return;
            }

            const data = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                consoleLogs: logs
            };

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
        chrome.storage.local.remove(['consoleLogs'], function() {
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