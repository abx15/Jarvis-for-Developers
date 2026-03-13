export default function TestStyling() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind CSS Test</h1>
        
        {/* Test basic colors */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-red-500 p-4 text-white rounded">Red</div>
          <div className="bg-green-500 p-4 text-white rounded">Green</div>
          <div className="bg-blue-500 p-4 text-white rounded">Blue</div>
        </div>

        {/* Test gradients */}
        <div className="bg-gradient-to-r from-purple-400 to-pink-600 p-8 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-white">Gradient Test</h2>
        </div>

        {/* Test card hover effects */}
        <div className="bg-white shadow-lg p-6 rounded-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-semibold mb-4">Card Hover Test</h3>
          <p className="text-gray-600">This card should have shadow effects on hover.</p>
        </div>

        {/* Test buttons */}
        <div className="flex gap-4 mt-8">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition-colors">
            Secondary Button
          </button>
        </div>
      </div>
    </div>
  )
}
