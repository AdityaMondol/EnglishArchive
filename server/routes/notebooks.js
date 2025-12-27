import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireEditor } from '../middleware/auth.js';

const router = express.Router();

// Get all published notebooks (public)
router.get('/', async (req, res) => {
    try {
        let query = supabaseAdmin
            .from('notebooks')
            .select(`
        id,
        title,
        description,
        cover_image,
        is_published,
        created_at,
        updated_at,
        chapters:chapters(count)
      `)
            .order('created_at', { ascending: false });

        // If not an editor, only show published notebooks
        if (!req.isEditor) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform chapters count
        const notebooks = data.map(notebook => ({
            ...notebook,
            chapter_count: notebook.chapters?.[0]?.count || 0
        }));

        res.json(notebooks);
    } catch (error) {
        console.error('Get notebooks error:', error);
        res.status(500).json({ error: 'Failed to fetch notebooks' });
    }
});

// Get single notebook with chapters (public for published)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let query = supabaseAdmin
            .from('notebooks')
            .select(`
        id,
        title,
        description,
        cover_image,
        is_published,
        created_at,
        updated_at,
        chapters (
          id,
          title,
          order_index,
          pages (
            id,
            title,
            order_index
          )
        )
      `)
            .eq('id', id)
            .single();

        // If not an editor, only allow viewing published notebooks
        if (!req.isEditor) {
            query = query.eq('is_published', true);
        }

        const { data, error } = await query;

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Notebook not found' });
            }
            throw error;
        }

        // Sort chapters and pages by order_index
        if (data.chapters) {
            data.chapters.sort((a, b) => a.order_index - b.order_index);
            data.chapters.forEach(chapter => {
                if (chapter.pages) {
                    chapter.pages.sort((a, b) => a.order_index - b.order_index);
                }
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Get notebook error:', error);
        res.status(500).json({ error: 'Failed to fetch notebook' });
    }
});

// Create notebook (editors only)
router.post('/', requireEditor, async (req, res) => {
    try {
        const { title, description, cover_image, is_published = true } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const { data, error } = await supabaseAdmin
            .from('notebooks')
            .insert({
                title,
                description,
                cover_image,
                is_published,
                created_by: req.user.id
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Create notebook error:', error);
        res.status(500).json({ error: 'Failed to create notebook' });
    }
});

// Update notebook (editors only)
router.put('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, cover_image, is_published } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (cover_image !== undefined) updates.cover_image = cover_image;
        if (is_published !== undefined) updates.is_published = is_published;

        const { data, error } = await supabaseAdmin
            .from('notebooks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Notebook not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Update notebook error:', error);
        res.status(500).json({ error: 'Failed to update notebook' });
    }
});

// Delete notebook (editors only)
router.delete('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('notebooks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Notebook deleted successfully' });
    } catch (error) {
        console.error('Delete notebook error:', error);
        res.status(500).json({ error: 'Failed to delete notebook' });
    }
});

export default router;
