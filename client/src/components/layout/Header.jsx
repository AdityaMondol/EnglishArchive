import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { BookOpen, Menu, X, LogIn, LogOut, LayoutDashboard, Sun, Moon, Globe, Trash2, User, Save } from 'lucide-react'
import Button from '../ui/Button'
import AuthModal from '../auth/LoginModal'
import Modal from '../ui/Modal'

export default function Header() {
    const { user, profile, isEditor, signOut, deleteAccount, updateProfile } = useAuth()
    const { t, toggleLanguage } = useLanguage()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [profileModalOpen, setProfileModalOpen] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Profile form
    const [profileName, setProfileName] = useState('')
    const [profileAvatar, setProfileAvatar] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)

    const location = useLocation()

    const toggleDarkMode = () => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle('dark')
    }

    const handleSignOut = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleting(true)
        try {
            await deleteAccount()
            setDeleteModalOpen(false)
        } catch (error) {
            console.error('Delete account error:', error)
        } finally {
            setDeleting(false)
        }
    }

    const openProfileModal = () => {
        setProfileName(profile?.name || '')
        setProfileAvatar(profile?.avatar || '')
        setProfileModalOpen(true)
    }

    const handleSaveProfile = async () => {
        setSavingProfile(true)
        try {
            await updateProfile(profileName, profileAvatar)
            setProfileModalOpen(false)
        } catch (error) {
            console.error('Save profile error:', error)
        } finally {
            setSavingProfile(false)
        }
    }

    const navLinks = [
        { to: '/', label: t.nav.notebooks, icon: BookOpen },
    ]

    if (isEditor) {
        navLinks.push({ to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard })
    }

    const displayName = profile?.name || user?.email?.split('@')[0] || ''

    return (
        <>
            <header className="sticky top-0 z-40 glass border-b border-surface-200/50 dark:border-surface-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg gradient-primary text-white">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            <span className="text-lg font-bold text-gradient">
                                {t.home.title}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                    transition-colors duration-200
                    ${location.pathname === link.to
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Language toggle */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm
                  text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="hidden sm:inline">{t.nav.language}</span>
                            </button>

                            {/* Dark mode toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="p-1.5 rounded-lg text-surface-500 hover:bg-surface-100 
                  dark:hover:bg-surface-800 transition-colors"
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {/* Auth buttons */}
                            {user ? (
                                <div className="hidden md:flex items-center gap-2">
                                    {/* Profile button */}
                                    <button
                                        onClick={openProfileModal}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                      text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                    >
                                        {profile?.avatar ? (
                                            <img src={profile.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                        ) : (
                                            <User className="w-4 h-4" />
                                        )}
                                        <span className="text-sm max-w-[100px] truncate">{displayName}</span>
                                    </button>

                                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                    <button
                                        onClick={() => setDeleteModalOpen(true)}
                                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500
                      hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        title={t.auth.deleteAccount}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setAuthModalOpen(true)}
                                    className="hidden md:flex"
                                >
                                    <LogIn className="w-4 h-4" />
                                    {t.nav.signIn}
                                </Button>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-1.5 rounded-lg text-surface-500 
                  hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-surface-200 dark:border-surface-800">
                        <div className="px-4 py-3 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg
                    ${location.pathname === link.to
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                                            : 'text-surface-600 dark:text-surface-400'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </Link>
                            ))}

                            <div className="pt-2 border-t border-surface-200 dark:border-surface-800 space-y-2">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                openProfileModal()
                                                setMobileMenuOpen(false)
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                        text-surface-600 dark:text-surface-400"
                                        >
                                            <User className="w-5 h-5" />
                                            {t.profile?.edit || 'Edit Profile'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleSignOut()
                                                setMobileMenuOpen(false)
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                        text-surface-600 dark:text-surface-400"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            {t.nav.signOut}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeleteModalOpen(true)
                                                setMobileMenuOpen(false)
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                        text-red-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            {t.auth.deleteAccount}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setAuthModalOpen(true)
                                            setMobileMenuOpen(false)
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg
                      text-primary-600"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        {t.nav.signIn}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
            />

            {/* Profile Modal */}
            <Modal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                title={t.profile?.edit || 'Edit Profile'}
                size="sm"
            >
                <div className="space-y-4">
                    <div>
                        <label className="label">{t.profile?.name || 'Name'}</label>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="input"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="label">{t.profile?.avatar || 'Avatar URL'}</label>
                        <input
                            type="url"
                            value={profileAvatar}
                            onChange={(e) => setProfileAvatar(e.target.value)}
                            className="input"
                            placeholder="https://example.com/photo.jpg"
                        />
                        {profileAvatar && (
                            <div className="mt-2">
                                <img
                                    src={profileAvatar}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover mx-auto"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" onClick={() => setProfileModalOpen(false)} className="flex-1">
                            {t.common.cancel}
                        </Button>
                        <Button variant="primary" onClick={handleSaveProfile} loading={savingProfile} className="flex-1">
                            <Save className="w-4 h-4" />
                            {t.common.save}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete account confirmation */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={t.auth.deleteAccount}
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-surface-600 dark:text-surface-400">
                        {t.auth.deleteConfirm}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModalOpen(false)}
                            className="flex-1"
                        >
                            {t.common.cancel}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            loading={deleting}
                            className="flex-1"
                        >
                            {t.common.delete}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
