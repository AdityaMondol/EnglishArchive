import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { FolderOpen, FileText, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'

export default function ChapterList({
    chapters,
    notebookId,
    onAddChapter,
    onEditChapter,
    onDeleteChapter,
    onAddPage
}) {
    const { isEditor } = useAuth()
    const { t } = useLanguage()

    if (!chapters || chapters.length === 0) {
        return (
            <div className="text-center py-10">
                <FolderOpen className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-500 mb-4">{t.notebook.noChapters}</p>
                {isEditor && onAddChapter && (
                    <button onClick={onAddChapter} className="btn-primary text-sm">
                        <Plus className="w-4 h-4" />
                        {t.notebook.addFirstChapter}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-medium text-surface-900 dark:text-white">
                    {t.home.chapters}
                </h2>
                {isEditor && onAddChapter && (
                    <button onClick={onAddChapter} className="btn-primary text-sm py-1.5">
                        <Plus className="w-4 h-4" />
                        {t.notebook.addChapter}
                    </button>
                )}
            </div>

            {chapters.map((chapter) => (
                <div key={chapter.id} className="card p-4 group">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600">
                            <FolderOpen className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-surface-900 dark:text-white">
                                    {chapter.title}
                                </h3>
                                {isEditor && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEditChapter && (
                                            <button onClick={() => onEditChapter(chapter)} className="p-1 rounded text-surface-400 hover:text-primary-500">
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                        {onDeleteChapter && (
                                            <button onClick={() => onDeleteChapter(chapter.id)} className="p-1 rounded text-surface-400 hover:text-red-500">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {chapter.pages?.length > 0 ? (
                                <div className="mt-2 space-y-1">
                                    {chapter.pages.map((page) => (
                                        <Link
                                            key={page.id}
                                            to={`/page/${page.id}`}
                                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm
                        text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800"
                                        >
                                            <FileText className="w-3 h-3" />
                                            <span className="truncate">{page.title}</span>
                                            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-surface-400">{t.notebook.noPages}</p>
                            )}

                            {isEditor && onAddPage && (
                                <button
                                    onClick={() => onAddPage(chapter.id)}
                                    className="mt-2 text-xs text-primary-600 hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    {t.notebook.addPage}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
