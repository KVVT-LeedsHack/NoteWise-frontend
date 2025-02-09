document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.getElementById('videoForm');
    const videoUrlInput = document.getElementById('videoUrl');
    const transcriptArea = document.getElementById('transcript');
    const transcriptionStatus = document.getElementById('transcriptionStatus');
    const analyzeButton = document.getElementById('analyzeButton');
    const modal = document.getElementById('analysisModal');
    const closeBtn = modal.querySelector('.close-btn');
    const analysisResults = document.getElementById('analysisResults');
    let isTranscribing = false;
    let recognition = null;

    // Extract YouTube video ID from various URL formats
    const getYouTubeVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Convert YouTube URL to embed URL
    const getYouTubeEmbedUrl = (url) => {
        const videoId = getYouTubeVideoId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        }
        return url;
    };

    // Initialize speech recognition
    const initializeSpeechRecognition = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript + '\n';
                    }
                }
                transcriptArea.value += currentTranscript;
                transcriptArea.scrollTop = transcriptArea.scrollHeight;
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                isTranscribing = false;
                updateTranscriptionStatus();
            };

            recognition.onend = () => {
                if (isTranscribing) {
                    recognition.start();
                }
            };

            return true;
        } catch (error) {
            console.error('Speech recognition not supported:', error);
            return false;
        }
    };

    // Update transcription status message
    const updateTranscriptionStatus = () => {
        transcriptionStatus.textContent = isTranscribing 
            ? 'Transcribing...' 
            : 'Play the video to start transcription';
    };

    // Handle video form submission
    videoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const videoUrl = videoUrlInput.value.trim();
        if (videoUrl) {
            const embedUrl = getYouTubeEmbedUrl(videoUrl);
            const videoContainer = document.querySelector('.video-container');
            
            if (getYouTubeVideoId(videoUrl)) {
                videoContainer.innerHTML = `
                    <iframe
                        id="videoPlayer"
                        width="100%"
                        height="100%"
                        src="${embedUrl}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                `;
            } else {
                videoContainer.innerHTML = `
                    <video id="videoPlayer" controls>
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }

            transcriptArea.value = '';
            
            const player = document.getElementById('videoPlayer');
            player.addEventListener('play', () => {
                if (recognition && !isTranscribing) {
                    isTranscribing = true;
                    recognition.start();
                    updateTranscriptionStatus();
                }
            });

            player.addEventListener('pause', () => {
                if (recognition && isTranscribing) {
                    isTranscribing = false;
                    recognition.stop();
                    updateTranscriptionStatus();
                }
            });

            player.addEventListener('ended', () => {
                if (recognition && isTranscribing) {
                    isTranscribing = false;
                    recognition.stop();
                    updateTranscriptionStatus();
                }
            });
        }
    });

    // Handle analyze button click
    analyzeButton.addEventListener('click', async () => {
        const notesContent = document.getElementById('notes').value;
        const transcriptContent = document.getElementById('transcript').value;

        try {
            modal.style.display = 'block';
            analysisResults.innerHTML = '<p>Analyzing content...</p>';

            // Replace with your backend endpoint
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notes: notesContent,
                    transcript: transcriptContent
                })
            });

            if (!response.ok) {
                throw new Error('Analysis request failed');
            }

            const data = await response.json();
            analysisResults.innerHTML = `
                <div class="analysis-content">
                    ${data.analysis}
                </div>
            `;
        } catch (error) {
            console.error('Error during analysis:', error);
            analysisResults.innerHTML = `
                <div class="error-message">
                    An error occurred during analysis. Please try again later.
                </div>
            `;
        }
    });

    // Close modal when clicking the close button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Initialize speech recognition when the page loads
    if (!initializeSpeechRecognition()) {
        transcriptionStatus.textContent = 'Speech recognition is not supported in this browser';
    }
});