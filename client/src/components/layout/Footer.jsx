import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { BookOpen, Heart } from 'lucide-react'

export default function Footer() {
    const { t } = useLanguage()

    return (
        <footer className="mt-auto border-t border-surface-200 dark:border-surface-800
      bg-white/50 dark:bg-surface-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo and tagline */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg gradient-primary text-white">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-surface-600 dark:text-surface-400">
                            {t.footer.tagline}
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-sm text-surface-500 hover:text-surface-700 
                dark:hover:text-surface-300 transition-colors"
                        >
                            {t.footer.home}
                        </Link>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800
          text-center text-sm text-surface-400">
                    <p className="flex items-center justify-center gap-1">
                        {t.footer.forKnowledge}
                    </p>
                    <p className="mt-1">© {new Date().getFullYear()} {t.footer.rights}</p>
                </div>
            </div>
        </footer>
    )
}
