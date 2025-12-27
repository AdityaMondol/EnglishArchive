import { useState } from 'react'
import { Bold, Italic, Code, Link, List, ListOrdered, Quote, Heading1, Heading2, Heading3 } from 'lucide-react'

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing...',
    minHeight = '300px'
}) {
    const [selectionStart, setSelectionStart] = useState(0)
    const [selectionEnd, setSelectionEnd] = useState(0)

    const handleSelect = (e) => {
        setSelectionStart(e.target.selectionStart)
        setSelectionEnd(e.target.selectionEnd)
    }

    const insertText = (before, after = '') => {
        const textarea = document.getElementById('content-editor')
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)

        const newValue =
            value.substring(0, start) +
            before + selectedText + after +
            value.substring(end)

        onChange(newValue)

        // Set cursor position after insertion
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = start + before.length + selectedText.length + after.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    const wrapSelection = (wrapper) => {
        const textarea = document.getElementById('content-editor')
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)

        if (selectedText) {
            const newValue =
                value.substring(0, start) +
                wrapper + selectedText + wrapper +
                value.substring(end)
            onChange(newValue)
        }
    }

    const insertAtLineStart = (prefix) => {
        const textarea = document.getElementById('content-editor')
        const start = textarea.selectionStart

        // Find line start
        let lineStart = start
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--
        }

        const newValue =
            value.substring(0, lineStart) +
            prefix +
            value.substring(lineStart)

        onChange(newValue)
    }

    const toolbarButtons = [
        { icon: Heading1, action: () => insertAtLineStart('# '), title: 'Heading 1' },
        { icon: Heading2, action: () => insertAtLineStart('## '), title: 'Heading 2' },
        { icon: Heading3, action: () => insertAtLineStart('### '), title: 'Heading 3' },
        { type: 'divider' },
        { icon: Bold, action: () => wrapSelection('**'), title: 'Bold' },
        { icon: Italic, action: () => wrapSelection('*'), title: 'Italic' },
        { icon: Code, action: () => wrapSelection('`'), title: 'Inline Code' },
        { type: 'divider' },
        { icon: List, action: () => insertAtLineStart('- '), title: 'Bullet List' },
        { icon: ListOrdered, action: () => insertAtLineStart('1. '), title: 'Numbered List' },
        { icon: Quote, action: () => insertAtLineStart('> '), title: 'Quote' },
        { type: 'divider' },
        { icon: Link, action: () => insertText('[', '](url)'), title: 'Link' },
    ]

    return (
        <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-surface-50 dark:bg-surface-800 
        border-b border-surface-200 dark:border-surface-700 flex-wrap">
                {toolbarButtons.map((btn, index) =>
                    btn.type === 'divider' ? (
                        <div key={index} className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />
                    ) : (
                        <button
                            key={index}
                            type="button"
                            onClick={btn.action}
                            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 
                dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700
                transition-colors"
                            title={btn.title}
                        >
                            <btn.icon className="w-4 h-4" />
                        </button>
                    )
                )}
            </div>

            {/* Editor */}
            <textarea
                id="content-editor"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onSelect={handleSelect}
                placeholder={placeholder}
                className="w-full p-4 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100
          placeholder:text-surface-400 focus:outline-none resize-none font-mono text-sm"
                style={{ minHeight }}
            />

            {/* Help text */}
            <div className="px-4 py-2 bg-surface-50 dark:bg-surface-800 
        border-t border-surface-200 dark:border-surface-700
        text-xs text-surface-400">
                Supports Markdown: **bold**, *italic*, `code`, # headings, - lists, &gt; quotes
            </div>
        </div>
    )
}
