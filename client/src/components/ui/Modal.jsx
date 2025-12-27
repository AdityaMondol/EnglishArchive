import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}) {
    const overlayRef = useRef(null)
    const contentRef = useRef(null)

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/50 backdrop-blur-sm animate-fade-in"
        >
            <div
                ref={contentRef}
                className={`w-full ${sizes[size]} glass-card p-6 animate-scale-in`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    {title && (
                        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">
                            {title}
                        </h2>
                    )}
                    {showClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-surface-400 hover:text-surface-600
                hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    )
}
