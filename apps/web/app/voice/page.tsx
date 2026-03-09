'use client';

import React, { useState } from 'react';

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Mock stop listening
      setTimeout(() => {
        setTranscript('Create a new React component with TypeScript and Tailwind CSS');
        handleProcessVoice('Create a new React component with TypeScript and Tailwind CSS');
      }, 2000);
    } else {
      setIsListening(true);
      setTranscript('');
      setResponse('');
    }
  };

  const handleProcessVoice = async (command: string) => {
    setIsProcessing(true);
    
    // Mock AI processing
    setTimeout(() => {
      setResponse(`I'll help you ${command.toLowerCase()}. Here's the TypeScript React component with Tailwind CSS:

\`\`\`typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  
  return (
    <button 
      className={\`\${baseClasses} \${variantClasses}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
\`\`\`

This component includes TypeScript props, Tailwind styling, and proper React patterns. You can customize the variants and add more features as needed!`);
      setIsProcessing(false);
    }, 3000);
  };

  const commands = [
    'Create a new React component',
    'Fix this TypeScript error',
    'Add authentication to the app',
    'Generate unit tests',
    'Optimize database queries'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Developer OS</h1>
              <span className="ml-4 text-sm text-gray-500">Voice Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening...' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Voice Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="mb-8">
              <button
                onClick={handleToggleListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              <p className="mt-4 text-lg font-medium text-gray-900">
                {isListening ? 'Listening for commands...' : 'Click to start voice input'}
              </p>
              <p className="text-sm text-gray-600">
                {isListening ? 'Speak clearly into your microphone' : 'Press the button and speak your command'}
              </p>
            </div>

            {transcript && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Transcript:</h4>
                <p className="text-blue-700">{transcript}</p>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Processing your command...</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Response */}
        {response && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Response</h3>
            <div className="prose max-w-none">
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                <code>{response}</code>
              </pre>
            </div>
            <div className="mt-4 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                Copy Code
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
                Save to File
              </button>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Voice Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commands.map((command, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{command}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Language</h4>
                <p className="text-sm text-gray-500">Select your preferred language</p>
              </div>
              <select className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Auto-detect commands</h4>
                <p className="text-sm text-gray-500">Automatically detect and execute commands</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Voice feedback</h4>
                <p className="text-sm text-gray-500">Play audio responses</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
