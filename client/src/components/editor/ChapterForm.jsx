import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

export default function ChapterForm({
    isOpen,
    onClose,
    onSubmit,
    chapter = null,
    loading = false
}) {
    const { t } = useLanguage()
    const [title, setTitle] = useState('')

    const isEditing = !!chapter

    useEffect(() => {
        if (chapter) {
            setTitle(chapter.title || '')
        } else {
            setTitle('')
        }
    }, [chapter, isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ title })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? t.common.edit : t.notebook.addChapter}
            size="sm"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="chapterTitle" className="label">{t.form.chapterTitle} *</label>
                    <input
                        id="chapterTitle"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input"
                        required
                        autoFocus
                    />
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
