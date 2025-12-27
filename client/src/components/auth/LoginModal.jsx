import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { isSupabaseConfigured } from '../../lib/supabase'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Mail, Lock, Key, AlertCircle, Info, User, CheckCircle } from 'lucide-react'

const EDITOR_CODE = '1234'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
    const { signIn, signUp } = useAuth()
    const { t } = useLanguage()
    const [mode, setMode] = useState(initialMode)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [editorCode, setEditorCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showTerms, setShowTerms] = useState(false)

    const resetForm = () => {
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setName('')
        setEditorCode('')
        setError('')
        setSuccess('')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin')
        setError('')
        setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (mode === 'signup') {
            if (password !== confirmPassword) {
                setError(t.auth.passwordMismatch)
                return
            }
            if (editorCode !== EDITOR_CODE) {
                setError(t.auth.invalidCode)
                return
            }
        }

        setLoading(true)

        try {
            if (mode === 'signin') {
                await signIn(email, password)
                handleClose()
            } else {
                await signUp(email, password, name)
                handleClose()
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to authenticate'
            // Check if it's an email confirmation message
            if (errorMsg.includes('check your email') || errorMsg.includes('confirm')) {
                setSuccess(errorMsg)
                setMode('signin')
            } else {
                setError(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    if (!isSupabaseConfigured()) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t.auth.signInTitle}>
                <div className="text-center py-4">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <p className="text-surface-600 dark:text-surface-400">
                        Authentication is not configured.
                    </p>
                </div>
            </Modal>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={mode === 'signin' ? t.auth.signInTitle : t.auth.signUpTitle}
        >
            {showTerms ? (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-surface-900 dark:text-white mb-2">
                            {t.terms.title}
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                            {t.terms.content}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-medium text-surface-900 dark:text-white mb-2">
                            {t.terms.privacy}
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                            {t.terms.privacyContent}
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => setShowTerms(false)} className="w-full">
                        {t.common.back}
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 
              text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 
              text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            {success}
                        </div>
                    )}

                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="name" className="label">{t.profile?.name || 'Name'}</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input pl-10"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="label">{t.auth.email}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input pl-10"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="label">{t.auth.password}</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-10"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {mode === 'signup' && (
                        <>
                            <div>
                                <label htmlFor="confirmPassword" className="label">
                                    {t.auth.confirmPassword}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="editorCode" className="label">{t.auth.editorCode}</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                    <input
                                        id="editorCode"
                                        type="text"
                                        value={editorCode}
                                        onChange={(e) => setEditorCode(e.target.value)}
                                        className="input pl-10"
                                        placeholder="****"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-surface-500">{t.auth.editorCodeHint}</p>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">
                            {t.auth.cancel}
                        </Button>
                        <Button type="submit" variant="primary" loading={loading} className="flex-1">
                            {mode === 'signin'
                                ? (loading ? t.auth.signingIn : t.nav.signIn)
                                : (loading ? t.auth.signingUp : t.nav.signUp)
                            }
                        </Button>
                    </div>

                    <div className="text-center text-sm text-surface-500 dark:text-surface-400 space-y-2">
                        <p>
                            {mode === 'signin' ? t.auth.noAccount : t.auth.hasAccount}{' '}
                            <button type="button" onClick={switchMode} className="text-primary-600 dark:text-primary-400 hover:underline">
                                {mode === 'signin' ? t.auth.signUpHere : t.auth.signInHere}
                            </button>
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowTerms(true)}
                            className="flex items-center gap-1 mx-auto text-surface-400 hover:text-surface-600"
                        >
                            <Info className="w-3 h-3" />
                            {t.terms.title}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    )
}
