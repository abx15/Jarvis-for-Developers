import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">AI Developer OS</h1>
        <nav className="flex gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/repo" className="hover:underline">
            Repository
          </Link>
          <Link href="/voice" className="hover:underline">
            Voice
          </Link>
          <Link href="/vision" className="hover:underline">
            Vision
          </Link>
        </nav>
      </div>
      
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome to AI Developer Operating System
        </h2>
        <p className="text-gray-600 mb-8">
          Intelligent development platform with AI assistance, voice control, and vision understanding
        </p>
        <Link 
          href="/dashboard" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}
