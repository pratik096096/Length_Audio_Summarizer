chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startCapture') {
      // Request tab capture
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabCapture.capture({
          audio: true,
          video: false
        }, (stream) => {
          if (chrome.runtime.lastError) {
            console.error('Capture error:', chrome.runtime.lastError);
            sendResponse({error: chrome.runtime.lastError.message});
            return;
          }
          
          // Send stream to content script
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'startRecording',
            stream: stream
          });
          
          sendResponse({status: 'Capture started'});
        });
      });
      return true; // Needed for async sendResponse
    }
  });