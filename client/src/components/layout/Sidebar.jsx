import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    ChevronRight,
    ChevronDown,
    BookOpen,
    FileText,
    Plus,
    FolderOpen
} from 'lucide-react'

export default function Sidebar({
    notebook,
    currentPageId,
    onAddChapter,
    onAddPage
}) {
    const { isEditor } = useAuth()
    const [expandedChapters, setExpandedChapters] = useState(new Set())
    const location = useLocation()

    const toggleChapter = (chapterId) => {
        setExpandedChapters(prev => {
            const next = new Set(prev)
            if (next.has(chapterId)) {
                next.delete(chapterId)
            } else {
                next.add(chapterId)
            }
            return next
        })
    }

    if (!notebook) return null

    return (
        <aside className="w-72 flex-shrink-0 border-r border-surface-200 dark:border-surface-800
      bg-surface-50/50 dark:bg-surface-900/50 overflow-y-auto">
            <div className="p-4">
                {/* Notebook header */}
                <div className="mb-4">
                    <Link
                        to={`/notebook/${notebook.id}`}
                        className="flex items-center gap-2 text-lg font-semibold 
              text-surface-900 dark:text-white hover:text-primary-600 
              dark:hover:text-primary-400 transition-colors"
                    >
                        <BookOpen className="w-5 h-5 text-primary-500" />
                        <span className="truncate">{notebook.title}</span>
                    </Link>
                    {notebook.description && (
                        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
                            {notebook.description}
                        </p>
                    )}
                </div>

                {/* Chapters */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                            Chapters
                        </span>
                        {isEditor && onAddChapter && (
                            <button
                                onClick={onAddChapter}
                                className="p-1 rounded-lg text-surface-400 hover:text-primary-500
                  hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                title="Add chapter"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {notebook.chapters?.length === 0 ? (
                        <p className="text-sm text-surface-400 dark:text-surface-500 py-4 text-center">
                            No chapters yet
                        </p>
                    ) : (
                        notebook.chapters?.map((chapter) => {
                            const isExpanded = expandedChapters.has(chapter.id)
                            const hasPages = chapter.pages?.length > 0

                            return (
                                <div key={chapter.id} className="animate-fade-in">
                                    {/* Chapter header */}
                                    <button
                                        onClick={() => toggleChapter(chapter.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                      text-left text-surface-700 dark:text-surface-300
                      hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                    >
                                        {hasPages ? (
                                            isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-surface-400" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-surface-400" />
                                            )
                                        ) : (
                                            <span className="w-4" />
                                        )}
                                        <FolderOpen className="w-4 h-4 text-accent-500" />
                                        <span className="flex-1 truncate font-medium text-sm">
                                            {chapter.title}
                                        </span>
                                        {isEditor && onAddPage && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onAddPage(chapter.id)
                                                }}
                                                className="p-1 rounded opacity-0 group-hover:opacity-100
                          text-surface-400 hover:text-primary-500 transition-opacity"
                                                title="Add page"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        )}
                                    </button>

                                    {/* Pages */}
                                    {isExpanded && hasPages && (
                                        <div className="ml-6 mt-1 space-y-1 animate-slide-down">
                                            {chapter.pages.map((page) => (
                                                <Link
                                                    key={page.id}
                                                    to={`/page/${page.id}`}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg
                            text-sm transition-colors
                            ${currentPageId === page.id
                                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                                                        }`}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span className="truncate">{page.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </aside>
    )
}
