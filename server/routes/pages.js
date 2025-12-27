import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireEditor } from '../middleware/auth.js';

const router = express.Router();

// Get pages for a chapter (public for published notebooks)
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const { chapterId } = req.params;

        const { data, error } = await supabaseAdmin
            .from('pages')
            .select(`
        id,
        title,
        content,
        order_index,
        created_at,
        updated_at
      `)
            .eq('chapter_id', chapterId)
            .order('order_index', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Get pages error:', error);
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// Get single page with content
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('pages')
            .select(`
        id,
        chapter_id,
        title,
        content,
        order_index,
        created_at,
        updated_at,
        chapter:chapters (
          id,
          title,
          notebook_id,
          notebook:notebooks (
            id,
            title,
            is_published
          )
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Page not found' });
            }
            throw error;
        }

        // Check if notebook is published for non-editors
        if (!req.isEditor && !data.chapter?.notebook?.is_published) {
            return res.status(404).json({ error: 'Page not found' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({ error: 'Failed to fetch page' });
    }
});

// Create page (editors only)
router.post('/', requireEditor, async (req, res) => {
    try {
        const { chapter_id, title, content, order_index } = req.body;

        if (!chapter_id || !title) {
            return res.status(400).json({ error: 'Chapter ID and title are required' });
        }

        // Get the max order_index if not provided
        let finalOrderIndex = order_index;
        if (finalOrderIndex === undefined) {
            const { data: maxOrder } = await supabaseAdmin
                .from('pages')
                .select('order_index')
                .eq('chapter_id', chapter_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            finalOrderIndex = (maxOrder?.order_index ?? -1) + 1;
        }

        const { data, error } = await supabaseAdmin
            .from('pages')
            .insert({
                chapter_id,
                title,
                content: content || '',
                order_index: finalOrderIndex
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Create page error:', error);
        res.status(500).json({ error: 'Failed to create page' });
    }
});

// Update page (editors only)
router.put('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, order_index } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (content !== undefined) updates.content = content;
        if (order_index !== undefined) updates.order_index = order_index;

        const { data, error } = await supabaseAdmin
            .from('pages')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Page not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Update page error:', error);
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// Reorder pages (editors only)
router.put('/reorder/:chapterId', requireEditor, async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { pages } = req.body; // Array of { id, order_index }

        if (!Array.isArray(pages)) {
            return res.status(400).json({ error: 'Pages array is required' });
        }

        // Update each page's order
        for (const page of pages) {
            await supabaseAdmin
                .from('pages')
                .update({ order_index: page.order_index })
                .eq('id', page.id)
                .eq('chapter_id', chapterId);
        }

        res.json({ message: 'Pages reordered successfully' });
    } catch (error) {
        console.error('Reorder pages error:', error);
        res.status(500).json({ error: 'Failed to reorder pages' });
    }
});

// Delete page (editors only)
router.delete('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('pages')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Page deleted successfully' });
    } catch (error) {
        console.error('Delete page error:', error);
        res.status(500).json({ error: 'Failed to delete page' });
    }
});

export default router;
