'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Code2, Play, Save, Zap, FileText, Download, Upload } from 'lucide-react'

export default function EditorPage() {
  const [code, setCode] = useState(`// Welcome to AI Code Editor
function helloWorld() {
  console.log("Hello, AI Developer OS!");
  return "Welcome to the future of development";
}

// Try editing this code and see the AI suggestions
helloWorld();`)
  
  const [language, setLanguage] = useState('javascript')
  const [isAiSuggestion, setIsAiSuggestion] = useState(false)

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ]

  const handleAiSuggestion = () => {
    setIsAiSuggestion(true)
    setTimeout(() => {
      setCode(prev => prev + '\n\n// AI Suggestion:\n// Add error handling\ntry {\n  helloWorld();\n} catch (error) {\n  console.error("Error:", error);\n}')
      setIsAiSuggestion(false)
    }, 1500)
  }

  const handleRunCode = () => {
    console.log('Running code:', code)
    // In a real app, this would send code to backend for execution
  }

  const handleSaveCode = () => {
    console.log('Saving code:', code)
    // In a real app, this would save to backend
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Code2 className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Code Editor</h1>
                <p className="text-gray-600">Write and edit code with AI assistance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleSaveCode}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
              
              <button
                onClick={handleRunCode}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </button>
            </div>
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
              <div className="flex items-center space-x-4">
                <FileText className="w-4 h-4" />
                <span className="text-sm">main.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-gray-900 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
                placeholder="Start typing your code here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* AI Assistant Panel */}
          <div className="w-80 border-l bg-white">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                AI Assistant
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              <button
                onClick={handleAiSuggestion}
                disabled={isAiSuggestion}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAiSuggestion ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Getting suggestions...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Get AI Suggestions
                  </>
                )}
              </button>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Quick Actions:</h4>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Explain this code
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Find bugs
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Optimize performance
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Add comments
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  Generate tests
                </button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Code Info:</h4>
                <div className="text-sm text-gray-600">
                  <p>Lines: {code.split('\n').length}</p>
                  <p>Characters: {code.length}</p>
                  <p>Language: {language}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Console/Output */}
        <div className="h-32 border-t bg-gray-900 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-400">Console Output</h4>
            <button className="text-xs text-gray-500 hover:text-gray-400">Clear</button>
          </div>
          <div className="text-green-400 font-mono text-sm">
            {`> Ready to run your code...`}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
