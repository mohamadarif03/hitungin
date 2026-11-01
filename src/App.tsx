import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          Hitungin
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          React + Vite + TypeScript + Tailwind CSS
        </p>

        <div className="bg-slate-950/60 rounded-xl p-6 mb-6 border border-slate-800">
          <p className="text-sm font-medium text-slate-400 mb-2">Counter Test</p>
          <span className="text-5xl font-extrabold text-blue-400">{count}</span>
        </div>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold rounded-xl transition duration-200 shadow-lg cursor-pointer"
        >
          Tambah Hitungan
        </button>
      </div>
    </div>
  )
}
