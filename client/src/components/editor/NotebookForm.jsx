import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { BookOpen, Image } from 'lucide-react'

export default function NotebookForm({
    isOpen,
    onClose,
    onSubmit,
    notebook = null,
    loading = false
}) {
    const { t } = useLanguage()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [isPublished, setIsPublished] = useState(true)

    const isEditing = !!notebook

    useEffect(() => {
        if (notebook) {
            setTitle(notebook.title || '')
            setDescription(notebook.description || '')
            setCoverImage(notebook.cover_image || '')
            setIsPublished(notebook.is_published !== false)
        } else {
            setTitle('')
            setDescription('')
            setCoverImage('')
            setIsPublished(true)
        }
    }, [notebook, isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({
            title,
            description,
            cover_image: coverImage,
            is_published: isPublished
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? t.common.edit : t.dashboard.newNotebook}
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="label">{t.form.title} *</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="label">{t.form.description}</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input resize-none"
                        rows={2}
                    />
                </div>

                <div>
                    <label htmlFor="coverImage" className="label">{t.form.coverImage}</label>
                    <input
                        id="coverImage"
                        type="url"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="input"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600"
                    />
                    <label htmlFor="isPublished" className="text-sm text-surface-600">
                        {t.form.publishNotebook}
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" variant="primary" loading={loading} className="flex-1">
                        {isEditing ? t.form.save : t.form.create}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
