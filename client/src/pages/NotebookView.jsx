import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { notebooksApi, chaptersApi, pagesApi } from '../lib/api'
import ChapterList from '../components/notebook/ChapterList'
import ChapterForm from '../components/editor/ChapterForm'
import { PageLoader } from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import {
    BookOpen,
    ArrowLeft,
    Plus,
    AlertCircle,
    FolderOpen
} from 'lucide-react'

export default function NotebookView() {
    const { id } = useParams()
    const { isEditor } = useAuth()
    const { t } = useLanguage()
    const [notebook, setNotebook] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [chapterFormOpen, setChapterFormOpen] = useState(false)
    const [editingChapter, setEditingChapter] = useState(null)
    const [chapterLoading, setChapterLoading] = useState(false)

    useEffect(() => {
        loadNotebook()
    }, [id])

    const loadNotebook = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await notebooksApi.getOne(id)
            setNotebook(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddChapter = () => {
        setEditingChapter(null)
        setChapterFormOpen(true)
    }

    const handleEditChapter = (chapter) => {
        setEditingChapter(chapter)
        setChapterFormOpen(true)
    }

    const handleChapterSubmit = async (data) => {
        setChapterLoading(true)
        try {
            if (editingChapter) {
                await chaptersApi.update(editingChapter.id, data)
            } else {
                await chaptersApi.create({ ...data, notebook_id: id })
            }
            setChapterFormOpen(false)
            loadNotebook()
        } catch (err) {
            console.error('Chapter save error:', err)
        } finally {
            setChapterLoading(false)
        }
    }

    const handleDeleteChapter = async (chapterId) => {
        if (!confirm(t.common.confirm + '?')) return
        try {
            await chaptersApi.delete(chapterId)
            loadNotebook()
        } catch (err) {
            console.error('Chapter delete error:', err)
        }
    }

    const handleAddPage = async (chapterId) => {
        try {
            const page = await pagesApi.create({
                chapter_id: chapterId,
                title: 'New Page',
                content: ''
            })
            window.location.href = `/page/${page.id}`
        } catch (err) {
            console.error('Page create error:', err)
        }
    }

    if (loading) return <PageLoader />

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">{t.common.error}</h2>
                    <p className="text-surface-500 mb-4">{error}</p>
                    <Link to="/" className="btn-primary">
                        <ArrowLeft className="w-4 h-4" />
                        {t.common.back}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Back */}
            <Link to="/" className="inline-flex items-center gap-1 text-surface-500 hover:text-surface-700 mb-4 text-sm">
                <ArrowLeft className="w-4 h-4" />
                {t.notebook.backToHome}
            </Link>

            {/* Header */}
            <div className="card p-5 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 
            flex items-center justify-center flex-shrink-0">
                        {notebook.cover_image ? (
                            <img src={notebook.cover_image} alt="" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <BookOpen className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-surface-900 dark:text-white mb-1">
                            {notebook.title}
                        </h1>
                        {notebook.description && (
                            <p className="text-surface-600 dark:text-surface-400 text-sm">
                                {notebook.description}
                            </p>
                        )}
                        <p className="text-xs text-surface-400 mt-2">
                            {notebook.chapters?.length || 0} {t.home.chapters}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chapters */}
            <ChapterList
                chapters={notebook.chapters}
                notebookId={id}
                onAddChapter={isEditor ? handleAddChapter : null}
                onEditChapter={isEditor ? handleEditChapter : null}
                onDeleteChapter={isEditor ? handleDeleteChapter : null}
                onAddPage={isEditor ? handleAddPage : null}
            />

            <ChapterForm
                isOpen={chapterFormOpen}
                onClose={() => setChapterFormOpen(false)}
                onSubmit={handleChapterSubmit}
                chapter={editingChapter}
                loading={chapterLoading}
            />
        </div>
    )
}
