import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { PageLoader } from './components/ui/LoadingSpinner'

// Pages
import Home from './pages/Home'
import NotebookView from './pages/NotebookView'
import PageView from './pages/PageView'
import Dashboard from './pages/Dashboard'

function App() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center 
        bg-surface-50 dark:bg-surface-950">
                <PageLoader />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
            <Header />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/notebook/:id" element={<NotebookView />} />
                    <Route path="/page/:id" element={<PageView />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}

export default App
