import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { notebooksApi } from '../lib/api'
import NotebookCard from '../components/notebook/NotebookCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { BookOpen, Search, AlertCircle } from 'lucide-react'

export default function Home() {
    const { t } = useLanguage()
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadNotebooks()
    }, [])

    const loadNotebooks = async () => {
        try {
            setLoading(true)
            const data = await notebooksApi.getAll()
            setNotebooks(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredNotebooks = notebooks.filter(notebook =>
        notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notebook.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return <PageLoader />
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Simple header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
                    {t.home.title}
                </h1>
                <p className="text-surface-600 dark:text-surface-400">
                    {t.home.subtitle}
                </p>
            </div>

            {/* Search */}
            {notebooks.length > 0 && (
                <div className="max-w-md mx-auto mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.home.search}
                            className="input pl-10"
                        />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 
          text-red-600 dark:text-red-400 mb-6">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Notebooks */}
            {filteredNotebooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotebooks.map((notebook) => (
                        <NotebookCard key={notebook.id} notebook={notebook} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-surface-300 dark:text-surface-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-2">
                        {searchQuery ? t.home.noResults : t.home.noNotebooks}
                    </h3>
                    <p className="text-surface-500">
                        {searchQuery ? t.home.adjustSearch : t.home.checkLater}
                    </p>
                </div>
            )}
        </div>
    )
}
