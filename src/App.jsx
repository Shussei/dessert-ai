import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Navbar from "./components/Navbar"

import Home from "./pages/Home"
import Evaluator from "./pages/Evaluator"
import FlavorLab from "./pages/FlavorLab"
import Reformulator from "./pages/Reformulator"
import Compare from "./pages/Compare"
import Generator from "./pages/Generator"
import ExpoKiosk from "./pages/ExpoKiosk"
import Library from "./pages/Library"
import About from "./pages/About"
import Auth from "./pages/Auth"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-cream-100 text-chocolate-800 font-sans selection:bg-dustyrose-200/50">
          <Navbar />

          <main className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/evaluator" element={<Evaluator />} />
              <Route path="/flavorlab" element={<FlavorLab />} />
              <Route path="/reformulate" element={<Reformulator />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/generator" element={<Generator />} />
              <Route path="/expo" element={<ExpoKiosk />} />
              <Route path="/library" element={<Library />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>

          <footer className="w-full mt-20 border-t-[3px] border-chocolate-900 bg-cream-50">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-chocolate-400 text-xs font-mono">
              <p>
                © {new Date().getFullYear()} SavorSense — AI Culinary Intelligence
              </p>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <span className="text-caramel-600">Culinary R&D Platform</span>
                <span aria-hidden="true">●</span>
                <a href="mailto:natalmadekkal.2005@gmail.com" className="hover:text-chocolate-900 transition">
                  Contact Team
                </a>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
