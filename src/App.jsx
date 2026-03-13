import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Evaluator from "./pages/Evaluator"
import FlavorLab from "./pages/FlavorLab"
import Generator from "./pages/Generator"
import Library from "./pages/Library"
import About from "./pages/About"

export default function App() {

  return (

    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-pink-500/30">
        <Navbar />

        <main className="w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/evaluator" element={<Evaluator />} />
            <Route path="/flavorlab" element={<FlavorLab />} />
            <Route path="/generator" element={<Generator />} />
            <Route path="/library" element={<Library />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="w-full mt-20 border-t border-slate-800 bg-black/40 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">

            <p>
              © {new Date().getFullYear()} AI Dessert Evaluator - An AI Culinary Research Project
            </p>

            <div className="flex gap-6 mt-3 sm:mt-0">
              <a href="mailto:natalmadekkal.2005@gmail.com" className="hover:text-pink-400 transition">
                Contact
              </a>
            </div>

          </div>
        </footer>
      </div>

    </BrowserRouter>

  )
}