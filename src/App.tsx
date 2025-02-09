import React, { useState, useRef } from 'react';
import { User, Video, MessageSquareText, FileText, Link } from 'lucide-react';

function App() {
  const [notes, setNotes] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [userName] = useState('John Doe');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  };

  const startTranscription = async () => {
    if (!videoRef.current) return;

    try {
      setIsTranscribing(true);
      const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(prev => prev + ' ' + currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      // Start recognition when video plays
      videoRef.current.onplay = () => {
        recognition.start();
      };

      // Stop recognition when video pauses
      videoRef.current.onpause = () => {
        recognition.stop();
      };

    } catch (error) {
      console.error('Speech recognition not supported:', error);
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Video className="w-6 h-6" />
            Video Transcriber
          </h1>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">{userName}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Video URL Input */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <form onSubmit={handleVideoUrlSubmit} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-gray-500" />
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter video URL..."
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Load Video
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Video Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Video Player
            </h2>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                onLoadedData={startTranscription}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {isTranscribing ? 'Transcribing...' : 'Play the video to start transcription'}
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Transcript Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <MessageSquareText className="w-5 h-5" />
                Transcript
              </h2>
              <div className="h-48 overflow-y-auto">
                <textarea
                  className="w-full h-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Transcript will appear here as the video plays..."
                  readOnly
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </h2>
              <div className="h-48 overflow-y-auto">
                <textarea
                  className="w-full h-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Take your notes here..."
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;