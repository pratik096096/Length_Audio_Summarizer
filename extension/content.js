// // // content.js

// // let audioContext;
// // let mediaElementSource;
// // let recorder;
// // let audioChunks = [];
// // let videoElement = null;

// // // Start Listening - Capture the audio when "Start" is clicked
// // function startListening() {
// //     // Check if the current page is YouTube
// //     if (window.location.hostname.includes('youtube.com')) {
// //         videoElement = document.querySelector('video'); // Get the video element

// //         if (!videoElement) {
// //             console.error('No video element found');
// //             return;
// //         }

// //         // Set up audio context and media element source
// //         audioContext = new (window.AudioContext || window.webkitAudioContext)();
// //         mediaElementSource = audioContext.createMediaElementSource(videoElement);

// //         // Create a ScriptProcessorNode to capture the audio output
// //         recorder = audioContext.createScriptProcessor(2048, 1, 1);
// //         recorder.onaudioprocess = (event) => {
// //             const audioData = event.inputBuffer.getChannelData(0);
// //             audioChunks.push(new Float32Array(audioData)); // Collect audio data
// //         };

// //         // Connect everything together
// //         mediaElementSource.connect(recorder);
// //         recorder.connect(audioContext.destination);
        
// //         console.log('Started listening to the audio of the video');
// //     } else {
// //         console.error('This is not a YouTube video');
// //     }
// // }

// // // Stop Listening - Save the audio when "Stop" is clicked
// // function stopListening() {
// //     if (audioContext && recorder) {
// //         recorder.disconnect();
// //         mediaElementSource.disconnect();
        
// //         // Process the audio data into a Blob when the stop button is clicked
// //         const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
// //         audioChunks = []; // Reset for the next recording
        
// //         saveAudio(audioBlob); // Save the audio file
        
// //         console.log('Stopped listening to the audio');
// //     }
// // }

// // // This function will save the captured audio data (audioBlob) to Chrome's storage or backend
// // function saveAudio(audioBlob) {
// //     // Create a FormData object to send the audio data
// //     const formData = new FormData();
// //     formData.append('audio', audioBlob, 'audio-recording.wav');
    
// //     fetch('http://localhost:5000/api/audio/upload', {
// //         method: 'POST',
// //         body: formData,
// //     })
// //     .then((res) => res.json())
// //     .then((data) => {
// //         console.log('Audio uploaded successfully:', data);
// //     })
// //     .catch((err) => {
// //         console.error('Error uploading audio:', err);
// //     });
// // }

// // // Event listeners for the start and stop buttons
// // chrome.runtime.onMessage.addListener((message) => {
// //     if (message.action === 'startListening') {
// //         startListening(); // Start recording when the "Start" button is pressed
// //     } else if (message.action === 'stopListening') {
// //         stopListening(); // Stop recording and save the audio when the "Stop" button is pressed
// //     }
// // });
// //////////////////////////////////////
// let mediaRecorder;
// let audioChunks = [];
// let captureStream = null;

// // Start capturing audio when the user clicks start
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === 'startListening') {
//         chrome.tabCapture.capture({
//             audio: true,
//             video: false
//         }, (stream) => {
//             if (chrome.runtime.lastError) {
//                 console.error('Error capturing tab:', chrome.runtime.lastError);
//                 sendResponse({ error: chrome.runtime.lastError.message });
//                 return;
//             }

//             // Set up MediaRecorder to capture the stream
//             captureStream = stream;
//             mediaRecorder = new MediaRecorder(captureStream);
//             audioChunks = [];

//             mediaRecorder.ondataavailable = (event) => {
//                 audioChunks.push(event.data);
//             };

//             // Start recording audio, but don't save it yet
//             mediaRecorder.start();
//             sendResponse({ status: 'Recording started' });
//         });
//         return true; // Keep the response open for async operation
//     }

//     // Stop recording and save the audio when the user clicks stop
//     if (message.action === 'stopListening' && mediaRecorder) {
//         mediaRecorder.stop();
//         captureStream.getTracks().forEach(track => track.stop()); // Stop capturing

//         // Once the recording is stopped, create a Blob and save it
//         mediaRecorder.onstop = () => {
//             const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//             saveAudioToExtension(audioBlob); // Save the recorded audio to extension storage
//         };

//         sendResponse({ status: 'Recording stopped' });
//     }

//     return true; // Keep the response open for async operation
// });

// // Function to save audio to local storage (extension storage)
// function saveAudioToExtension(audioBlob) {
//     const audioUrl = URL.createObjectURL(audioBlob);
//     chrome.storage.local.set({ recordedAudioUrl: audioUrl }, () => {
//         console.log('Audio saved in extension storage');
//     });
// }


let mediaRecorder;
let audioChunks = [];
let isRecording = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    if (isRecording) return;
    
    // Set up MediaRecorder
    mediaRecorder = new MediaRecorder(message.stream);
    audioChunks = [];
    isRecording = true;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      isRecording = false;
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Save audio to storage
      const reader = new FileReader();
      reader.onloadend = () => {
        chrome.storage.local.set({
          recordedAudio: reader.result
        }, () => {
          console.log('Audio saved to storage');
          // Notify popup that recording is complete
          chrome.runtime.sendMessage({action: 'recordingSaved'});
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    // Start recording
    mediaRecorder.start();
    sendResponse({status: 'Recording started'});
  }

  if (message.action === 'stopRecording') {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      sendResponse({status: 'Recording stopped'});
    }
  }

  return true;
});