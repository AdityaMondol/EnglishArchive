import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { BookOpen, FileText, Calendar } from 'lucide-react'

export default function NotebookCard({ notebook }) {
    const { t } = useLanguage()

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Link
            to={`/notebook/${notebook.id}`}
            className="group card p-5 block hover:scale-[1.01] transition-all duration-200"
        >
            {/* Cover */}
            <div className="h-28 rounded-lg mb-4 overflow-hidden
        bg-gradient-to-br from-primary-500 to-purple-600 
        flex items-center justify-center">
                {notebook.cover_image ? (
                    <img
                        src={notebook.cover_image}
                        alt={notebook.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <BookOpen className="w-10 h-10 text-white/80" />
                )}
            </div>

            {/* Content */}
            <div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white
          group-hover:text-primary-600 dark:group-hover:text-primary-400 
          transition-colors line-clamp-1 mb-1">
                    {notebook.title}
                </h3>

                {notebook.description && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">
                        {notebook.description}
                    </p>
                )}

                <div className="flex items-center gap-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {notebook.chapter_count || 0} {t.home.chapters}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(notebook.updated_at || notebook.created_at)}
                    </span>
                </div>

                {!notebook.is_published && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full
            bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                        {t.dashboard.draft}
                    </span>
                )}
            </div>
        </Link>
    )
}
