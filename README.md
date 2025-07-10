# Tab Recorder - Defect Reproduction Tool

A Chrome extension designed to record tab actions for defect reproduction, starting with console logging capabilities.

## Features

### Current Features
- **Console Log Recording**: Captures all console.log, console.error, console.warn, console.info, and console.debug calls
- **Timestamp Tracking**: Each log entry includes precise timestamps
- **Data Export**: Export recorded data as JSON files
- **Visual Feedback**: Extension badge shows recording status
- **Modern UI**: Clean, intuitive popup interface

### Planned Features
- Mouse click recording
- Keyboard input recording
- Network request recording
- Screenshot capture
- Video recording

## Installation

### Development Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd defect-reproducer-tool
   ```

2. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the folder containing this extension

3. **Verify installation**
   - The extension should appear in your extensions list
   - You should see the Tab Recorder icon in your Chrome toolbar

## Usage

### Basic Console Recording

1. **Navigate to a webpage** you want to record
2. **Click the Tab Recorder extension icon** in your Chrome toolbar
3. **Click "Start Recording"** to begin capturing console logs
4. **Interact with the webpage** - any console.log calls will be captured
5. **Click "Stop Recording"** when finished
6. **Click "Export Data"** to download the recorded logs as a JSON file

### What Gets Recorded

The extension captures:
- Console log messages (log, error, warn, info, debug)
- Timestamps for each log entry
- URL of the page being recorded
- User agent information
- Recording start/stop events

### Export Format

The exported JSON file contains:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "url": "https://example.com",
  "consoleLogs": [
    {
      "timestamp": "2024-01-01T12:00:01.000Z",
      "level": "log",
      "message": "User clicked button",
      "url": "https://example.com",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

## Development

### File Structure
```
defect-reproducer-tool/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── background.js          # Background service worker
├── content.js            # Content script (injected into pages)
├── icons/                # Extension icons
└── README.md            # This file
```

### Key Components

- **manifest.json**: Defines permissions, scripts, and extension metadata
- **popup.html/js**: User interface for controlling recording
- **background.js**: Service worker that manages recording state and data storage
- **content.js**: Injected into web pages to intercept console calls

### Adding New Features

To add new recording capabilities:

1. **Update manifest.json** with new permissions if needed
2. **Modify content.js** to capture new events (clicks, keyboard, etc.)
3. **Update background.js** to handle new data types
4. **Enhance popup.html/js** for new controls
5. **Update export functionality** to include new data

## Troubleshooting

### Extension Not Working
- Check that Developer mode is enabled in Chrome extensions
- Reload the extension after making changes
- Check Chrome's developer console for errors

### Console Logs Not Being Captured
- Ensure the extension is loaded on the page
- Check that the content script is running (look for "Tab Recorder content script loaded" in console)
- Verify recording is active (extension badge should show "REC")

### Export Issues
- Ensure you have recorded some data before trying to export
- Check that the JSON file downloads properly
- Verify the file contains the expected data structure

## Browser Compatibility

- Chrome 88+ (Manifest V3)
- Other Chromium-based browsers (Edge, Brave, etc.)

## License

This project is open source. Feel free to modify and distribute according to your needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- **Mouse Tracking**: Record mouse movements and clicks
- **Keyboard Recording**: Capture keyboard input
- **Network Monitoring**: Track API calls and responses
- **Screenshot Integration**: Capture screenshots at key moments
- **Video Recording**: Full screen recording capabilities
- **Session Replay**: Replay recorded sessions
- **Cloud Storage**: Save recordings to cloud storage
- **Collaboration**: Share recordings with team members 