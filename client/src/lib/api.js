const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Get auth token from session storage
const getAuthToken = () => {
    const session = sessionStorage.getItem('supabase-session')
    if (session) {
        try {
            const parsed = JSON.parse(session)
            return parsed.access_token
        } catch {
            return null
        }
    }
    return null
}

// API helper with auth headers
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken()

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
}

// Auth API
export const authApi = {
    getMe: () => apiRequest('/auth/me'),
}

// Notebooks API
export const notebooksApi = {
    getAll: () => apiRequest('/notebooks'),
    getOne: (id) => apiRequest(`/notebooks/${id}`),
    create: (data) => apiRequest('/notebooks', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => apiRequest(`/notebooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => apiRequest(`/notebooks/${id}`, {
        method: 'DELETE',
    }),
}

// Chapters API
export const chaptersApi = {
    getByNotebook: (notebookId) => apiRequest(`/chapters/notebook/${notebookId}`),
    getOne: (id) => apiRequest(`/chapters/${id}`),
    create: (data) => apiRequest('/chapters', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => apiRequest(`/chapters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    reorder: (notebookId, chapters) => apiRequest(`/chapters/reorder/${notebookId}`, {
        method: 'PUT',
        body: JSON.stringify({ chapters }),
    }),
    delete: (id) => apiRequest(`/chapters/${id}`, {
        method: 'DELETE',
    }),
}

// Pages API
export const pagesApi = {
    getByChapter: (chapterId) => apiRequest(`/pages/chapter/${chapterId}`),
    getOne: (id) => apiRequest(`/pages/${id}`),
    create: (data) => apiRequest('/pages', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => apiRequest(`/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    reorder: (chapterId, pages) => apiRequest(`/pages/reorder/${chapterId}`, {
        method: 'PUT',
        body: JSON.stringify({ pages }),
    }),
    delete: (id) => apiRequest(`/pages/${id}`, {
        method: 'DELETE',
    }),
}
