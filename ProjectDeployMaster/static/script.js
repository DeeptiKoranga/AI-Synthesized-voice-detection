// DOM Elements
const detectBtn = document.getElementById('detectBtn');
const fileInput = document.getElementById('fileInput');
const resultText = document.getElementById('resultText');
const loader = document.getElementById('loader');
const recordBtn = document.getElementById('recordBtn');
const fileNameText = document.getElementById('fileNameText');
const fileNameDisplay = document.getElementById('fileNameDisplay');

let recordedBlob = null;
let mediaRecorder;
let chunks = [];

// Function to detect voice from file or recording
const detectVoice = async (inputFile) => {
  loader.style.display = 'block';
  resultText.textContent = '';

  try {
    const formData = new FormData();
    formData.append('file', inputFile);

    const response = await fetch('/predict', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Prediction Failed');

    const result = await response.json();
    loader.style.display = 'none';

    let displayConfidence;
    if (result.label === "Human Voice") {
      displayConfidence = 100 - result.confidence;
    } else {
      displayConfidence = result.confidence * 100;
    }

    resultText.textContent = `Detection Result: ${result.label} (Confidence: ${displayConfidence.toFixed(2)}%)`;

  } catch (error) {
    loader.style.display = 'none';
    resultText.textContent = 'Error: ' + error.message;
  }
};

// Event listener for file input
fileInput.addEventListener('change', () => {
  recordedBlob = null; // reset any previous recording
  showFileName();
});

// Show selected file name
function showFileName() {
  if (fileInput.files.length > 0) {
    fileNameText.textContent = fileInput.files[0].name;
    fileNameDisplay.style.display = 'flex';
  } else {
    fileNameDisplay.style.display = 'none';
  }
}

// Event listener for detect button
detectBtn.addEventListener('click', () => {
  if (recordedBlob) {
    const recordedFile = new File([recordedBlob], 'recording.wav', { type: 'audio/wav' });
    detectVoice(recordedFile);
  } else if (fileInput.files[0]) {
    detectVoice(fileInput.files[0]);
  } else {
    alert('Please select or record an audio file to detect!');
  }
});

// Record Button Toggle
recordBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = 'Start Recording';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

  mediaRecorder.onstop = () => {
  recordedBlob = new Blob(chunks, { type: 'audio/wav' });

  // Set the audio source to preview the recorded audio
  const audioURL = URL.createObjectURL(recordedBlob);
  const audioPreview = document.getElementById('audioPreview');
  audioPreview.src = audioURL;
  audioPreview.style.display = 'block'; // Show the audio preview

  fileNameText.textContent = 'Recorded Audio';
  fileNameDisplay.style.display = 'flex';
};


    mediaRecorder.start();
    recordBtn.textContent = 'Stop Recording';
  } catch (err) {
    alert('Microphone access denied or not supported.');
  }
});
