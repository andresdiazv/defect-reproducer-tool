# Tab Recorder - Defect Reproduction Tool

A Chrome extension for recording tab actions to help with defect reproduction, starting with comprehensive console logging.

## Features

- **Console Log Recording**: Captures all console methods (`log`, `error`, `warn`, `info`, `debug`)
- **Real-time Recording**: Start/stop recording with a single click
- **Export Functionality**: Export captured logs as JSON with timestamps and metadata
- **Cross-tab Support**: Works on any webpage
- **Reliable Performance**: No race conditions or timing issues

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

<img width="1918" height="979" alt="image" src="https://github.com/user-attachments/assets/b0cef6d9-51b6-4bb7-81de-5954640698f8" />

## Technical Details

- **Manifest Version**: 3
- **Content Scripts**: Isolated world injection for console override
- **Background Service Worker**: Handles log storage and management
- **Storage**: In-memory array with Chrome storage persistence

## File Structure

```
├── manifest.json          # Extension configuration
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

MIT License - feel free to use and modify as needed. 
