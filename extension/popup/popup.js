let mediaRecorder;
let audioChunks = [];
// Authentication State Management
let currentUser = null;
// let authToken = null;

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

const trackerSection = document.getElementById('tracker');
const audioRecordingsSection = document.getElementById('audioRecordings');
const audioDetailsSection = document.getElementById('audioDetails');
const recordingsList = document.getElementById('recordingsList');
const audioPlayer = document.getElementById('audioPlayer');
// const summaryContent = document.getElementById('summaryContent')


// Event Listeners for Navigation
document.getElementById('viewAudios').addEventListener('click', fetchUserRecordings);
document.getElementById('backToTracker').addEventListener('click', () => {
    audioRecordingsSection.style.display = 'none';
    trackerSection.style.display = 'block';
});
document.getElementById('backToRecordings').addEventListener('click', () => {
    audioDetailsSection.style.display = 'none';
    audioRecordingsSection.style.display = 'block';
});
// document.getElementById('summarizeBtn').addEventListener('click', summarizeAudio);


async function fetchUserRecordings() {
    try {
        // Retrieve token from Chrome storage
        const authToken = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['token'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.token);
                }
            });
        });

        if (!authToken) {
            alert('No auth token found. Please log in.');
            return;
        }

        // Fetch user recordings
        const response = await fetch('http://localhost:5000/api/audio/recordings', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recordings');
        }

        const recordingsResponse = await response.json();
        console.log('API Response:', recordingsResponse);

        // Extract the recordings array from the response
        const recordings = recordingsResponse.recordings;

        if (!Array.isArray(recordings)) {
            throw new Error('API response recordings field is not an array');
        }

        // Populate the recordings list
        const recordingsList = document.getElementById('recordingsList');
        recordingsList.innerHTML = ''; // Clear previous list
        recordings.forEach((recording) => {
            const recordingElement = document.createElement('div');
            recordingElement.innerHTML = `
                <div>
                    <p>Recording: ${recording.originalName}</p>
                    <button class="view-audio" data-id="${recording._id}">View Details</button>
                </div>
            `;
            recordingsList.appendChild(recordingElement);
        });

        // Add event listeners to view audio buttons
        recordingsList.querySelectorAll('.view-audio').forEach((btn) => {
            btn.addEventListener('click', (e) => viewAudioDetails(e.target.dataset.id));
        });

        document.getElementById('tracker').style.display = 'none';
        document.getElementById('audioRecordings').style.display = 'block';
    } catch (error) {
        console.error('Error fetching recordings:', error);
        alert('Failed to fetch recordings');
    }
}

//audio details

async function viewAudioDetails(audioId) {
    try {
        const authToken = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['token'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.token);
                }
            });
        });

        if (!authToken) {
            alert('No auth token found. Please log in.');
            return;
        }

        // Fetch audio details by ID
        const response = await fetch(`http://localhost:5000/api/audio/${audioId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        

        if (!response.ok) {
            throw new Error('Failed to fetch audio details');
        }

        const audioDetails = await response.json();
        const userId = audioDetails.userId;
        const filename = audioDetails.filename;

        const audioUrl = `http://localhost:5000/uploads/${userId}/${filename}`;
        console.log('Audio URL:', audioUrl);

        // Check if the audio file exists
        const fileCheck = await fetch(audioUrl, { method: 'HEAD' });
        if (!fileCheck.ok) {
            throw new Error(`Audio file not found: ${audioUrl}`);
        }

        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = audioUrl;
        audioPlayer.load();

        // Show audio details section
        document.getElementById('audioRecordings').style.display = 'none';
        document.getElementById('audioDetails').style.display = 'block';

        console.log('Audio loaded successfully');
    } catch (error) {
        console.error('Error fetching or playing audio:', error);
        alert(`Failed to fetch or play audio: ${error.message}`);
    }
    
}

