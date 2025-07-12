# Tab Recorder - Defect Reproduction Tool

A Chrome extension for recording tab actions to help with defect reproduction, starting with comprehensive console logging.

## Features

- **Console Log Recording**: Captures all console methods (`log`, `error`, `warn`, `info`, `debug`)
- **Real-time Recording**: Start/stop recording with a single click
- **Export Functionality**: Export captured logs as JSON with timestamps and metadata
<<<<<<< HEAD
- **Cross-tab Support**: Works on any webpage
- **Reliable Performance**: No race conditions or timing issues
=======
>>>>>>> cd718653ba22eb82f2683ce547e23f419e3639f7

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. **Start Recording**: Click the extension icon and press "Start Recording"
2. **Interact with the page**: Navigate, click buttons, trigger console logs
3. **Stop Recording**: Click "Stop Recording" when done
4. **Export Data**: Click "Export Data" to download a JSON file with all captured logs

## Current Status (07/11/2025)

### ✅ Recently Fixed Issues

#### 1. Race Conditions in Storage
- **Problem**: `chrome.storage.local.get/set` had race conditions causing log loss
- **Solution**: In-memory array with reliable append operations

#### 2. Message Flow Issues
- **Problem**: Content script wasn't properly forwarding all log levels
- **Solution**: Fixed message listener to handle all levels correctly

#### 3. Timing Issues
- **Problem**: Console overrides happening before recording started
- **Solution**: Better initialization timing and polling mechanism

### 🚀 Current Capabilities

✅ `console.log()` messages  
✅ `console.error()` messages  
✅ `console.warn()` messages  
✅ `console.info()` messages  
✅ `console.debug()` messages  
✅ Proper timestamps and metadata  
✅ Works on first click (no more double-click needed)

<<<<<<< HEAD
## Technical Details

- **Manifest Version**: 3
- **Content Scripts**: Isolated world injection for console override
- **Background Service Worker**: Handles log storage and management
- **Storage**: In-memory array with Chrome storage persistence
=======
## Demo

This is a picture of how the extension looks when opened on my testing page used for simulating errors and debugging.  
<img width="1000" alt="Extension on test page" src="https://github.com/user-attachments/assets/6bc23866-9710-4112-b84f-e5afb179888a" />

This is a picture of when the extension is ready to record.  
<img width="300" alt="Ready to record" src="https://github.com/user-attachments/assets/409750d5-149f-4f7c-b77a-22b50f402797" />

This is a picture of when the extension is in the recording phase.  
<img width="300" alt="Recording in progress" src="https://github.com/user-attachments/assets/08db60e1-895b-4c3c-9afd-2992d39c68e1" />

This is the exported JSON file opened in Notepad.  
<img width="700" alt="Exported JSON" src="https://github.com/user-attachments/assets/74228884-52bb-4e6f-bfcd-253c31a7df57" />
>>>>>>> cd718653ba22eb82f2683ce547e23f419e3639f7

## File Structure

```
<<<<<<< HEAD
├── manifest.json          # Extension configuration
=======
├── manifest.json         # Extension configuration
>>>>>>> cd718653ba22eb82f2683ce547e23f419e3639f7
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and export functionality
├── content.js            # Content script for console interception
├── background.js         # Background service worker
├── injected.js           # Console override script (injected into page)
├── test-console.html     # Test page for development
└── icons/                # Extension icons
```

## Development

To test the extension:
1. Load the extension in Chrome
2. Open `test-console.html` in a new tab
3. Start recording and click the test buttons
4. Export the data to verify all console levels are captured

## Future Enhancements

- Network request recording
- User interaction tracking
- Screenshot capture
- Performance monitoring
- Multiple export formats (HAR, ZIP)

## License

<<<<<<< HEAD
MIT License - feel free to use and modify as needed. 
=======
MIT License - feel free to use and modify as needed. 
>>>>>>> cd718653ba22eb82f2683ce547e23f419e3639f7
