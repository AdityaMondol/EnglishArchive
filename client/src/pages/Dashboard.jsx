import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { notebooksApi } from '../lib/api'
import NotebookForm from '../components/editor/NotebookForm'
import Button from '../components/ui/Button'
import { PageLoader } from '../components/ui/LoadingSpinner'
import {
    Plus,
    BookOpen,
    FolderOpen,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    LayoutDashboard,
    AlertCircle
} from 'lucide-react'

export default function Dashboard() {
    const { user, isEditor, loading: authLoading } = useAuth()
    const { t } = useLanguage()
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [notebookFormOpen, setNotebookFormOpen] = useState(false)
    const [editingNotebook, setEditingNotebook] = useState(null)
    const [notebookLoading, setNotebookLoading] = useState(false)

    useEffect(() => {
        if (isEditor) {
            loadNotebooks()
        }
    }, [isEditor])

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

    const handleCreateNotebook = () => {
        setEditingNotebook(null)
        setNotebookFormOpen(true)
    }

    const handleEditNotebook = (notebook) => {
        setEditingNotebook(notebook)
        setNotebookFormOpen(true)
    }

    const handleNotebookSubmit = async (data) => {
        setNotebookLoading(true)
        try {
            if (editingNotebook) {
                await notebooksApi.update(editingNotebook.id, data)
            } else {
                await notebooksApi.create(data)
            }
            setNotebookFormOpen(false)
            loadNotebooks()
        } catch (err) {
            console.error('Notebook save error:', err)
        } finally {
            setNotebookLoading(false)
        }
    }

    const handleDeleteNotebook = async (id) => {
        if (!confirm(t.common.confirm + '?')) return
        try {
            await notebooksApi.delete(id)
            loadNotebooks()
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    const handleTogglePublish = async (notebook) => {
        try {
            await notebooksApi.update(notebook.id, {
                is_published: !notebook.is_published
            })
            loadNotebooks()
        } catch (err) {
            console.error('Toggle publish error:', err)
        }
    }

    if (authLoading) return <PageLoader />
    if (!user || !isEditor) return <Navigate to="/" replace />

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-primary text-white">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                            {t.dashboard.title}
                        </h1>
                        <p className="text-sm text-surface-500">{t.dashboard.subtitle}</p>
                    </div>
                </div>
                <Button variant="primary" size="sm" onClick={handleCreateNotebook}>
                    <Plus className="w-4 h-4" />
                    {t.dashboard.newNotebook}
                </Button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 
          text-red-600 dark:text-red-400 mb-4 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card p-3">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-500" />
                        <span className="text-lg font-bold">{notebooks.length}</span>
                        <span className="text-sm text-surface-500">{t.dashboard.notebooks}</span>
                    </div>
                </div>
                <div className="card p-3">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-accent-500" />
                        <span className="text-lg font-bold">
                            {notebooks.reduce((sum, n) => sum + (n.chapter_count || 0), 0)}
                        </span>
                        <span className="text-sm text-surface-500">{t.dashboard.chapters}</span>
                    </div>
                </div>
                <div className="card p-3">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        <span className="text-lg font-bold">
                            {notebooks.filter(n => n.is_published).length}
                        </span>
                        <span className="text-sm text-surface-500">{t.dashboard.published}</span>
                    </div>
                </div>
            </div>

            {/* Notebooks */}
            {loading ? (
                <PageLoader />
            ) : notebooks.length === 0 ? (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t.dashboard.noNotebooks}</h3>
                    <p className="text-surface-500 mb-4">{t.dashboard.createFirst}</p>
                    <Button variant="primary" onClick={handleCreateNotebook}>
                        <Plus className="w-4 h-4" />
                        {t.dashboard.newNotebook}
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {notebooks.map((notebook) => (
                        <div key={notebook.id} className="card p-4 flex items-center gap-4">
                            <Link to={`/notebook/${notebook.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 
                  flex items-center justify-center flex-shrink-0">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{notebook.title}</p>
                                    <p className="text-sm text-surface-500">
                                        {notebook.chapter_count || 0} {t.home.chapters} · {formatDate(notebook.updated_at)}
                                    </p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleTogglePublish(notebook)}
                                    className={`p-2 rounded-lg transition-colors ${notebook.is_published
                                            ? 'text-emerald-500 hover:bg-emerald-50'
                                            : 'text-amber-500 hover:bg-amber-50'
                                        }`}
                                >
                                    {notebook.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleEditNotebook(notebook)}
                                    className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-surface-100"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteNotebook(notebook.id)}
                                    className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-surface-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NotebookForm
                isOpen={notebookFormOpen}
                onClose={() => setNotebookFormOpen(false)}
                onSubmit={handleNotebookSubmit}
                notebook={editingNotebook}
                loading={notebookLoading}
            />
        </div>
    )
}
