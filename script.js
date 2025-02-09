document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.getElementById('videoForm');
    const videoUrlInput = document.getElementById('videoUrl');
    const transcriptArea = document.getElementById('transcript');
    const transcriptionStatus = document.getElementById('transcriptionStatus');
    const analyzeButton = document.getElementById('analyzeButton');
    const modal = document.getElementById('analysisModal');
    const closeBtn = modal.querySelector('.close-btn');
    const analysisResults = document.getElementById('analysisResults');

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

            transcriptionStatus.textContent = 'Ready for transcript input';
        }
    });

    // Handle analyze button click
    analyzeButton.addEventListener('click', async () => {
        const notesContent = document.getElementById('notes').value;
        const transcriptContent = document.getElementById('transcript').value;

        try {
            modal.style.display = 'block';
            analysisResults.innerHTML = '<p>Analyzing content...</p>';

            // Create text files from the input contents
            const notesBlob = new Blob([notesContent], { type: 'text/plain' });
            const transcriptBlob = new Blob([transcriptContent], { type: 'text/plain' });

            // Create file objects from the blobs
            const notesFile = new File([notesBlob], 'notes.txt', { type: 'text/plain' });
            const transcriptFile = new File([transcriptBlob], 'transcript.txt', { type: 'text/plain' });

            // Create a FormData object to send files in a multipart/form-data format
            const formData = new FormData();
            formData.append('notes_file', notesFile);
            formData.append('transcript_file', transcriptFile);

            // Replace with your Gemini backend endpoint
            const response = await fetch('https://notewise-2ihi.onrender.com/compare-notes-gemini', {
                method: 'POST',
                body: formData  // Use FormData for file uploads
            });

            if (!response.ok) {
                throw new Error('Analysis request failed');
            }

            const data = await response.json();

            console.log('Response Data:', data.enhanced_notes);

            analysisResults.innerHTML = `
                <div class="analysis-content">
                    ${data.enhanced_notes}
                </div>
            `;
        } catch (error) {
            console.log('Error during analysis:', error);
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
});
