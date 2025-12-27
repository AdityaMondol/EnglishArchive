import { useMemo } from 'react'

// Simple markdown-like rendering
function parseContent(content) {
    if (!content) return []

    const lines = content.split('\n')
    const elements = []
    let currentList = null
    let codeBlock = null

    lines.forEach((line, index) => {
        // Code block
        if (line.startsWith('```')) {
            if (codeBlock) {
                elements.push({
                    type: 'code',
                    content: codeBlock.content,
                    language: codeBlock.language,
                    key: index
                })
                codeBlock = null
            } else {
                codeBlock = {
                    language: line.slice(3).trim(),
                    content: ''
                }
            }
            return
        }

        if (codeBlock) {
            codeBlock.content += (codeBlock.content ? '\n' : '') + line
            return
        }

        // Headers
        if (line.startsWith('# ')) {
            elements.push({ type: 'h1', content: line.slice(2), key: index })
            return
        }
        if (line.startsWith('## ')) {
            elements.push({ type: 'h2', content: line.slice(3), key: index })
            return
        }
        if (line.startsWith('### ')) {
            elements.push({ type: 'h3', content: line.slice(4), key: index })
            return
        }

        // Blockquote
        if (line.startsWith('> ')) {
            elements.push({ type: 'blockquote', content: line.slice(2), key: index })
            return
        }

        // List items
        if (line.match(/^[-*]\s/)) {
            if (!currentList) {
                currentList = { type: 'ul', items: [], key: index }
            }
            currentList.items.push(line.slice(2))
            return
        } else if (currentList) {
            elements.push(currentList)
            currentList = null
        }

        // Numbered list
        if (line.match(/^\d+\.\s/)) {
            if (!currentList || currentList.type !== 'ol') {
                if (currentList) elements.push(currentList)
                currentList = { type: 'ol', items: [], key: index }
            }
            currentList.items.push(line.replace(/^\d+\.\s/, ''))
            return
        } else if (currentList && currentList.type === 'ol') {
            elements.push(currentList)
            currentList = null
        }

        // Horizontal rule
        if (line.match(/^---+$/)) {
            elements.push({ type: 'hr', key: index })
            return
        }

        // Paragraph
        if (line.trim()) {
            elements.push({ type: 'p', content: line, key: index })
        } else {
            elements.push({ type: 'br', key: index })
        }
    })

    if (currentList) elements.push(currentList)
    if (codeBlock) {
        elements.push({
            type: 'code',
            content: codeBlock.content,
            language: codeBlock.language,
            key: 'code-final'
        })
    }

    return elements
}

// Render inline formatting (bold, italic, code, links)
function renderInline(text) {
    if (!text) return null

    // Replace patterns
    let result = text
    const elements = []
    let lastIndex = 0

    // Simple regex patterns
    const patterns = [
        { regex: /\*\*(.+?)\*\*/g, render: (m) => <strong key={m.index}>{m[1]}</strong> },
        { regex: /\*(.+?)\*/g, render: (m) => <em key={m.index}>{m[1]}</em> },
        { regex: /`(.+?)`/g, render: (m) => <code key={m.index} className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-sm font-mono">{m[1]}</code> },
        { regex: /\[(.+?)\]\((.+?)\)/g, render: (m) => <a key={m.index} href={m[2]} className="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">{m[1]}</a> },
    ]

    // For simplicity, just return the text with basic HTML-safe rendering
    return text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={i}>{part.slice(1, -1)}</em>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-sm font-mono">{part.slice(1, -1)}</code>
        }
        const linkMatch = part.match(/\[(.+?)\]\((.+?)\)/)
        if (linkMatch) {
            return <a key={i} href={linkMatch[2]} className="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">{linkMatch[1]}</a>
        }
        return part
    })
}

export default function PageContent({ content, className = '' }) {
    const elements = useMemo(() => parseContent(content), [content])

    if (!content) {
        return (
            <div className={`text-center py-12 text-surface-400 ${className}`}>
                <p>This page is empty.</p>
            </div>
        )
    }

    return (
        <div className={`prose-content ${className}`}>
            {elements.map((el) => {
                switch (el.type) {
                    case 'h1':
                        return <h1 key={el.key} className="text-3xl font-bold mb-4 mt-8 first:mt-0">{renderInline(el.content)}</h1>
                    case 'h2':
                        return <h2 key={el.key} className="text-2xl font-semibold mb-3 mt-6">{renderInline(el.content)}</h2>
                    case 'h3':
                        return <h3 key={el.key} className="text-xl font-medium mb-2 mt-4">{renderInline(el.content)}</h3>
                    case 'p':
                        return <p key={el.key} className="mb-4 leading-relaxed">{renderInline(el.content)}</p>
                    case 'blockquote':
                        return (
                            <blockquote key={el.key} className="border-l-4 border-primary-500 pl-4 py-2 my-4 bg-surface-50 dark:bg-surface-800/50 rounded-r-lg">
                                {renderInline(el.content)}
                            </blockquote>
                        )
                    case 'ul':
                        return (
                            <ul key={el.key} className="list-disc list-inside mb-4 space-y-1">
                                {el.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
                            </ul>
                        )
                    case 'ol':
                        return (
                            <ol key={el.key} className="list-decimal list-inside mb-4 space-y-1">
                                {el.items.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
                            </ol>
                        )
                    case 'code':
                        return (
                            <pre key={el.key} className="bg-surface-900 dark:bg-surface-950 text-surface-100 p-4 rounded-xl overflow-x-auto mb-4">
                                <code className="font-mono text-sm">{el.content}</code>
                            </pre>
                        )
                    case 'hr':
                        return <hr key={el.key} className="my-8 border-surface-200 dark:border-surface-700" />
                    case 'br':
                        return <div key={el.key} className="h-2" />
                    default:
                        return null
                }
            })}
        </div>
    )
}
