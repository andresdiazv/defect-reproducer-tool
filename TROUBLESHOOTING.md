# Tab Recorder Troubleshooting Guide

## Common Issues and Solutions

### 1. "Error: Could not start recording"

**Symptoms:**
- Extension popup shows "Error: Could not start recording"
- Recording doesn't start when clicking the button

**Solutions:**

#### A. Refresh the Page
1. Navigate to the page you want to record
2. Refresh the page (F5 or Ctrl+R)
3. Try starting recording again

#### B. Check Extension Permissions
1. Go to `chrome://extensions/`
2. Find "Tab Recorder" in the list
3. Click "Details"
4. Ensure all permissions are granted
5. If not, click "Allow" for any missing permissions

#### C. Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Tab Recorder"
3. Click the refresh/reload button
4. Try recording again

#### D. Check for Console Errors
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any error messages
4. If you see errors, try refreshing the page

### 2. Console Logs Not Being Captured

**Symptoms:**
- Recording starts but no logs are captured
- Export shows empty data

**Solutions:**

#### A. Verify Content Script is Running
1. Open Developer Tools (F12)
2. In the console, type: `window.isTabRecorderInitialized`
3. Should return `true`
4. If `undefined`, the content script isn't loaded

#### B. Check for Console Override
1. In the console, type: `console.log('test')`
2. You should see the message in the console
3. If recording is active, it should also be captured

#### C. Test with Simple Page
1. Open a simple page like `https://example.com`
2. Open Developer Tools
3. Type: `console.log('test message')`
4. Start recording and try again

### 3. Extension Not Loading

**Symptoms:**
- Extension doesn't appear in toolbar
- Error when loading extension

**Solutions:**

#### A. Check Manifest File
1. Ensure `manifest.json` is valid JSON
2. Check that all required files exist
3. Verify permissions are correct

#### B. Developer Mode
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Try loading the extension again

#### C. Check File Structure
Ensure your extension folder contains:
```
defect-reproducer-tool/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── content.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 4. Export Issues

**Symptoms:**
- Export button doesn't work
- No file is downloaded
- Empty or corrupted export file

**Solutions:**

#### A. Check Browser Downloads
1. Check your browser's download folder
2. Look for files named `tab-recorder-*.json`
3. Ensure downloads are allowed for the site

#### B. Check Storage
1. Open Developer Tools (F12)
2. Go to Application tab
3. Look for "Storage" → "Local Storage"
4. Check if console logs are being stored

### 5. Performance Issues

**Symptoms:**
- Extension slows down browser
- High memory usage
- Recording stops unexpectedly

**Solutions:**

#### A. Limit Log Storage
- The extension automatically limits to 1000 logs
- You can adjust this in `background.js`

#### B. Close Unused Tabs
- Recording on multiple tabs can use more resources
- Close tabs you're not actively recording

## Debugging Steps

### Step 1: Basic Check
1. Open `test-page.html` in Chrome
2. Open Developer Tools (F12)
3. Look for "Tab Recorder content script loaded successfully" in console
4. If not found, the content script isn't loading

### Step 2: Extension Check
1. Go to `chrome://extensions/`
2. Find "Tab Recorder"
3. Click "Errors" if any are shown
4. Check the extension ID and permissions

### Step 3: Communication Test
1. Open the test page
2. In console, run the debug script:
```javascript
// Copy and paste the contents of debug.js
```

### Step 4: Manual Test
1. Start recording
2. In console, type: `console.log('test message')`
3. Stop recording
4. Export data and check if the message was captured

## Getting Help

If you're still having issues:

1. **Check the console** for error messages
2. **Try on a different website** to isolate the issue
3. **Restart Chrome** completely
4. **Check Chrome version** - ensure it's 88 or higher
5. **Try in incognito mode** to rule out other extensions

## Common Error Messages

### "Could not establish connection"
- The content script isn't loaded
- Try refreshing the page

### "Extension context invalidated"
- The extension was reloaded
- Refresh the page and try again

### "Cannot access a chrome:// URL"
- Extensions can't run on Chrome's internal pages
- Try on a regular website

### "Permission denied"
- Check extension permissions in `chrome://extensions/`
- Ensure the extension has access to the current site 