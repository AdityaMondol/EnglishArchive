import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../lib/translations'

const LanguageContext = createContext({
    language: 'en',
    t: translations.en,
    setLanguage: () => { },
    toggleLanguage: () => { },
})

export const useLanguage = () => useContext(LanguageContext)

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem('language')
        return saved || 'en'
    })

    const t = translations[language]

    useEffect(() => {
        localStorage.setItem('language', language)
        // Update HTML lang attribute
        document.documentElement.lang = language
    }, [language])

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'bn' : 'en')
    }

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}
