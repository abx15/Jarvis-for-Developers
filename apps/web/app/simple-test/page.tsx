export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test basic Tailwind classes */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
          <p className="text-gray-600 text-lg mb-6">
            If you can see proper styling, Tailwind CSS is working correctly!
          </p>
          
          {/* Test colors and spacing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              Red Box
            </div>
            <div className="bg-green-500 text-white p-4 rounded-lg text-center">
              Green Box
            </div>
            <div className="bg-blue-500 text-white p-4 rounded-lg text-center">
              Blue Box
            </div>
          </div>

          {/* Test gradients */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg mb-6">
            <h2 className="text-2xl font-bold">Gradient Background</h2>
            <p>This should have a purple to pink gradient</p>
          </div>

          {/* Test hover effects */}
          <div className="bg-gray-100 p-6 rounded-lg hover:bg-gray-200 transition-colors duration-300">
            <h3 className="text-lg font-semibold mb-2">Hover Effect Test</h3>
            <p>Hover over this box to see the background color change</p>
          </div>
        </div>

        {/* Test buttons */}
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
            Secondary Button
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Outline Button
          </button>
        </div>
      </div>
    </div>
  )
}
