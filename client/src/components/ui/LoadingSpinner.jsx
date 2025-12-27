import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-surface-500 dark:text-surface-400">Loading...</p>
            </div>
        </div>
    )
}
