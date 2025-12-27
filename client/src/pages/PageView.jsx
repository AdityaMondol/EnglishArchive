import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { pagesApi } from '../lib/api'
import PageContent from '../components/notebook/PageContent'
import RichTextEditor from '../components/editor/RichTextEditor'
import { PageLoader } from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import {
    ArrowLeft,
    Pencil,
    Save,
    X,
    Trash2,
    BookOpen,
    FolderOpen,
    FileText,
    AlertCircle
} from 'lucide-react'

export default function PageView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isEditor } = useAuth()
    const { t } = useLanguage()
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadPage()
    }, [id])

    const loadPage = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await pagesApi.getOne(id)
            setPage(data)
            setEditTitle(data.title)
            setEditContent(data.content || '')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = () => {
        setEditTitle(page.title)
        setEditContent(page.content || '')
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditTitle(page.title)
        setEditContent(page.content || '')
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const updated = await pagesApi.update(id, {
                title: editTitle,
                content: editContent
            })
            setPage(updated)
            setIsEditing(false)
        } catch (err) {
            console.error('Save error:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(t.auth.deleteConfirm)) return

        try {
            await pagesApi.delete(id)
            if (page.chapter?.notebook_id) {
                navigate(`/notebook/${page.chapter.notebook_id}`)
            } else {
                navigate('/')
            }
        } catch (err) {
            console.error('Delete error:', err)
        }
    }

    if (loading) return <PageLoader />

    if (error || !page) {
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

    const notebook = page.chapter?.notebook
    const chapter = page.chapter

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-surface-500 mb-4 flex-wrap">
                <Link to="/" className="hover:text-surface-700">
                    <BookOpen className="w-4 h-4" />
                </Link>
                {notebook && (
                    <>
                        <span>/</span>
                        <Link to={`/notebook/${notebook.id}`} className="hover:text-surface-700 truncate max-w-[120px]">
                            {notebook.title}
                        </Link>
                    </>
                )}
                {chapter && (
                    <>
                        <span>/</span>
                        <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <FolderOpen className="w-3 h-3" />
                            {chapter.title}
                        </span>
                    </>
                )}
            </nav>

            {/* Page */}
            <article className="card">
                <div className="p-4 border-b border-surface-200 dark:border-surface-800">
                    <div className="flex items-start justify-between gap-3">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="input text-xl font-bold py-1.5"
                            />
                        ) : (
                            <h1 className="text-xl font-bold text-surface-900 dark:text-white">
                                {page.title}
                            </h1>
                        )}

                        {isEditor && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {isEditing ? (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
                                            <Save className="w-4 h-4" />
                                            {t.page.save}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={handleEdit}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDelete}
                                            className="text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4">
                    {isEditing ? (
                        <RichTextEditor
                            value={editContent}
                            onChange={setEditContent}
                            minHeight="300px"
                        />
                    ) : (
                        <PageContent content={page.content} />
                    )}
                </div>
            </article>

            {notebook && (
                <div className="mt-4 text-center">
                    <Link to={`/notebook/${notebook.id}`} className="text-primary-600 hover:underline text-sm">
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        {t.notebook.backToHome}
                    </Link>
                </div>
            )}
        </div>
    )
}
