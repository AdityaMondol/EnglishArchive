import express from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Get current user info and editor status
router.get('/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ user: null, isEditor: false })
    }

    const { data: editor } = await supabaseAdmin
      .from('editors')
      .select('id, is_active')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .single()

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.user_metadata?.name || '',
        avatar: req.user.user_metadata?.avatar || '',
        created_at: req.user.created_at
      },
      isEditor: !!editor
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user info' })
  }
})

// Make user an editor (called after signup with valid code)
router.post('/make-editor', async (req, res) => {
  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Check if already an editor
    const { data: existing } = await supabaseAdmin
      .from('editors')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      return res.json({ message: 'Already an editor' })
    }

    // Add as editor
    const { error } = await supabaseAdmin
      .from('editors')
      .insert({ user_id: userId, is_active: true })

    if (error) {
      console.error('Insert editor error:', error)
      throw error
    }

    res.json({ message: 'Editor status granted' })
  } catch (error) {
    console.error('Make editor error:', error)
    res.status(500).json({ error: 'Failed to grant editor status' })
  }
})

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, avatar } = req.body

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      {
        user_metadata: {
          name: name || '',
          avatar: avatar || ''
        }
      }
    )

    if (error) throw error

    res.json({
      message: 'Profile updated',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || '',
        avatar: data.user.user_metadata?.avatar || ''
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Delete user account
router.delete('/delete-account', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    // Remove from editors table first
    await supabaseAdmin
      .from('editors')
      .delete()
      .eq('user_id', userId)

    // Delete the user from Supabase Auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error

    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Failed to delete account' })
  }
})

export default router
