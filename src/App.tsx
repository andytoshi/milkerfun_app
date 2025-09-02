import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppWalletProvider } from './components/WalletProvider'
import { Navigation } from './components/Navigation'
import { HomePage } from './pages/HomePage'
import { FarmingHubPage } from './pages/FarmingHubPage'
import { StatsPage } from './pages/StatsPage'
import { AboutPage } from './pages/AboutPage'

function App() {
  return (
    <AppWalletProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-indigo-700">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/farming-hub" element={<FarmingHubPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppWalletProvider>
  )
}

export default App
