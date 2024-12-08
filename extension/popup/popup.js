// document.getElementById('loginBtn').addEventListener('click', () => {
//     const username = document.getElementById('username').value;
//     const password = document.getElementById('password').value;

//     fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.token) {
//             chrome.storage.local.set({ token: data.token });

//             const loginElement = document.getElementById('login');
//             const trackerElement = document.getElementById('tracker');

//             if (loginElement && trackerElement) {
//                 loginElement.style.display = 'none';
//                 trackerElement.style.display = 'block';
//             } else {
//                 console.error('Login or tracker element not found.');
//             }
//         } else {
//             alert('Login failed');
//         }
//     })
//     .catch(error => {
//         console.error('Error logging in:', error);
//         alert('Login failed');
//     });
// });

// document.addEventListener('DOMContentLoaded', () => {
//     chrome.storage.local.get('token', (data) => {
//         if (data.token) {
//             document.getElementById('login').style.display = 'none';
//             document.getElementById('tracker').style.display = 'block';
//         } else {
//             document.getElementById('login').style.display = 'block';
//             document.getElementById('tracker').style.display = 'none';
//         }
//     });
// });

// document.getElementById('registerBtn').addEventListener('click', () => {
//     const username = document.getElementById('regUsername').value;
//     const password = document.getElementById('regPassword').value;

//     fetch('http://localhost:5000/api/auth/register', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username, password })
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.message === 'User registered successfully') {
//             document.getElementById('register').style.display = 'none';
//             document.getElementById('login').style.display = 'block';
//         } else {
//             alert('Registration failed');
//         }
//     })
//     .catch(error => {
//         console.error('Error registering:', error);
//         alert('Registration failed');
//     });
// });

// document.getElementById('showRegister').addEventListener('click', () => {
//     document.getElementById('login').style.display = 'none';
//     document.getElementById('register').style.display = 'block';
// });

// document.getElementById('showLogin').addEventListener('click', () => {
//     document.getElementById('register').style.display = 'none';
//     document.getElementById('login').style.display = 'block';
// });

// document.getElementById('logoutBtn').addEventListener('click', () => {
//     chrome.storage.local.remove('token', () => {
//         document.getElementById('tracker').style.display = 'none';
//         document.getElementById('login').style.display = 'block';
//     });
// });

// // Start/Stop Listening
// // document.getElementById('start').addEventListener('click', () => {
// //     document.getElementById('status').textContent = 'Status: Listening...';
// //     chrome.runtime.sendMessage({ action: 'startListening' });
// // });

// // document.getElementById('stop').addEventListener('click', () => {
// //     document.getElementById('status').textContent = 'Status: Stopped';
// //     chrome.runtime.sendMessage({ action: 'stopListening' });
// // });

// // let mediaRecorder;
// // let audioChunks = [];

// // // HTML elements
// // // const startButton = document.getElementById('start');
// // const stopButton = document.getElementById('stop');
// // const statusText = document.getElementById('status');
// // const audioList = document.getElementById('audio-list');

// // // Start Recording
// // document.getElementById('start').addEventListener('click', async () => {
// //     try {
// //         // Request microphone access
// //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //         mediaRecorder = new MediaRecorder(stream);

// //         // Handle data availability event
// //         mediaRecorder.ondataavailable = (event) => {
// //             audioChunks.push(event.data);
// //         };

// //         // Handle the stop event
// //         mediaRecorder.onstop = async () => {
// //             const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
// //             audioChunks = []; // Reset for next recording

// //             // Prepare form data for backend upload
// //             const formData = new FormData();
// //             formData.append('audio', audioBlob, 'recording.webm');

// //             try {
// //                 const response = await fetch('http://localhost:5000/api/audio/upload', {
// //                     method: 'POST',
// //                     body: formData,
// //                 });

// //                 if (!response.ok) {
// //                     throw new Error(`Server error: ${response.status}`);
// //                 }

// //                 const data = await response.json();
// //                 console.log('Audio uploaded successfully:', data);
// //                 alert('Audio uploaded successfully!');
// //             } catch (err) {
// //                 console.error('Error uploading audio:', err);
// //                 alert('Failed to upload audio. Please try again.');
// //             }
// //         };

// //         // Start the recording
// //         mediaRecorder.start();
// //         document.getElementById('status').textContent = 'Recording...';
// //         document.getElementById('start').disabled = true;
// //         document.getElementById('stop').disabled = false;
// //     } catch (error) {
// //         console.error('Error accessing microphone:', error);
// //         alert('Microphone access is required for recording. Please check your browser settings.');
// //     }
// // });

// // // Stop Listening
// // // Stop Listening
// // stopButton.addEventListener('click', () => {
// //     mediaRecorder.stop();

// //     mediaRecorder.onstop = () => {
// //         // Create a Blob from the recorded chunks
// //         const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
// //         const formData = new FormData();

// //         // Attach the audio blob
// //         formData.append('audio', audioBlob, 'recording.webm');

// //         // Send to backend
// //         fetch('http://localhost:5000/api/audio/upload', {
// //             method: 'POST',
// //             body: formData,
// //         })
// //         .then(response => response.json())
// //         .then(data => {
// //             console.log('Audio uploaded successfully:', data);
// //         })
// //         .catch(error => {
// //             console.error('Error uploading audio:', error);
// //         });

// //         // Reset state
// //         audioChunks = [];
// //         statusText.textContent = 'Status: Idle';
// //         startButton.disabled = false;
// //         stopButton.disabled = true;
// //     };
// // });

// document.getElementById('start').addEventListener('click', () => {
//     chrome.runtime.sendMessage({ action: 'startListening' }, (response) => {
//         if (response.status === 'Recording started') {
//             document.getElementById('status').textContent = 'Status: Recording...';
//             document.getElementById('start').disabled = true;
//             document.getElementById('stop').disabled = false;
//         }
//     });
// });

// document.getElementById('stop').addEventListener('click', () => {
//     chrome.runtime.sendMessage({ action: 'stopListening' }, (response) => {
//         if (response.status === 'Recording stopped') {
//             document.getElementById('status').textContent = 'Status: Stopped';
//             document.getElementById('start').disabled = false;
//             document.getElementById('stop').disabled = true;
//         }
//     });
// });

let mediaRecorder;
let audioChunks = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status on load
    chrome.storage.local.get('token', (data) => {
        if (data.token) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('tracker').style.display = 'block';
        } else {
            document.getElementById('login').style.display = 'block';
            document.getElementById('tracker').style.display = 'none';
        }
    });

    // Login Event Listener
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                // Save token to chrome storage
                chrome.storage.local.set({ token: data.token }, () => {
                    document.getElementById('login').style.display = 'none';
                    document.getElementById('tracker').style.display = 'block';
                });
            } else {
                alert('Login failed');
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            alert('Login failed');
        });
    });

    // Registration Event Listener
    document.getElementById('registerBtn').addEventListener('click', () => {
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'User registered successfully') {
                document.getElementById('register').style.display = 'none';
                document.getElementById('login').style.display = 'block';
                alert('Registration successful. Please log in.');
            } else {
                alert('Registration failed');
            }
        })
        .catch(error => {
            console.error('Error registering:', error);
            alert('Registration failed');
        });
    });

    // Show/Hide Login and Register Forms
    document.getElementById('showRegister').addEventListener('click', () => {
        document.getElementById('login').style.display = 'none';
        document.getElementById('register').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        document.getElementById('register').style.display = 'none';
        document.getElementById('login').style.display = 'block';
    });

    // Logout Event Listener
    document.getElementById('logoutBtn').addEventListener('click', () => {
        chrome.storage.local.remove('token', () => {
            document.getElementById('tracker').style.display = 'none';
            document.getElementById('login').style.display = 'block';
        });
    });

    // Start Recording Event Listener
    document.getElementById('start').addEventListener('click', async () => {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; // Reset audio chunks

            // Handle data availability event
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            // Handle stop event
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = []; // Reset for next recording

                // Prepare form data for backend upload
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');

                // Retrieve token from storage for authenticated upload
                chrome.storage.local.get('token', async (data) => {
                    try {
                        const response = await fetch('http://localhost:5000/api/audio/upload', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${data.token}`
                            },
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error(`Server error: ${response.status}`);
                        }

                        const responseData = await response.json();
                        console.log('Audio uploaded successfully:', responseData);
                        
                        // Update UI to show successful upload
                        document.getElementById('status').textContent = 'Audio uploaded successfully!';
                    } catch (err) {
                        console.error('Error uploading audio:', err);
                        document.getElementById('status').textContent = 'Failed to upload audio';
                    }
                });
            };

            // Start recording
            mediaRecorder.start();
            document.getElementById('status').textContent = 'Recording...';
            document.getElementById('start').disabled = true;
            document.getElementById('stop').disabled = false;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            document.getElementById('status').textContent = 'Microphone access denied';
        }
    });

    // Stop Recording Event Listener
    document.getElementById('stop').addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            document.getElementById('status').textContent = 'Stopping and uploading...';
            document.getElementById('start').disabled = false;
            document.getElementById('stop').disabled = true;
        }
    });
});

