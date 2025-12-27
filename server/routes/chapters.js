import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireEditor } from '../middleware/auth.js';

const router = express.Router();

// Get chapters for a notebook (public for published notebooks)
router.get('/notebook/:notebookId', async (req, res) => {
    try {
        const { notebookId } = req.params;

        // First check if notebook exists and is accessible
        let notebookQuery = supabaseAdmin
            .from('notebooks')
            .select('id, is_published')
            .eq('id', notebookId)
            .single();

        if (!req.isEditor) {
            notebookQuery = notebookQuery.eq('is_published', true);
        }

        const { data: notebook, error: notebookError } = await notebookQuery;

        if (notebookError || !notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        const { data, error } = await supabaseAdmin
            .from('chapters')
            .select(`
        id,
        title,
        order_index,
        created_at,
        updated_at,
        pages (
          id,
          title,
          order_index
        )
      `)
            .eq('notebook_id', notebookId)
            .order('order_index', { ascending: true });

        if (error) throw error;

        // Sort pages within each chapter
        data.forEach(chapter => {
            if (chapter.pages) {
                chapter.pages.sort((a, b) => a.order_index - b.order_index);
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Get chapters error:', error);
        res.status(500).json({ error: 'Failed to fetch chapters' });
    }
});

// Get single chapter
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('chapters')
            .select(`
        id,
        notebook_id,
        title,
        order_index,
        created_at,
        updated_at,
        pages (
          id,
          title,
          order_index
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Chapter not found' });
            }
            throw error;
        }

        // Sort pages by order_index
        if (data.pages) {
            data.pages.sort((a, b) => a.order_index - b.order_index);
        }

        res.json(data);
    } catch (error) {
        console.error('Get chapter error:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
});

// Create chapter (editors only)
router.post('/', requireEditor, async (req, res) => {
    try {
        const { notebook_id, title, order_index } = req.body;

        if (!notebook_id || !title) {
            return res.status(400).json({ error: 'Notebook ID and title are required' });
        }

        // Get the max order_index if not provided
        let finalOrderIndex = order_index;
        if (finalOrderIndex === undefined) {
            const { data: maxOrder } = await supabaseAdmin
                .from('chapters')
                .select('order_index')
                .eq('notebook_id', notebook_id)
                .order('order_index', { ascending: false })
                .limit(1)
                .single();

            finalOrderIndex = (maxOrder?.order_index ?? -1) + 1;
        }

        const { data, error } = await supabaseAdmin
            .from('chapters')
            .insert({
                notebook_id,
                title,
                order_index: finalOrderIndex
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Create chapter error:', error);
        res.status(500).json({ error: 'Failed to create chapter' });
    }
});

// Update chapter (editors only)
router.put('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, order_index } = req.body;

        const updates = {};
        if (title !== undefined) updates.title = title;
        if (order_index !== undefined) updates.order_index = order_index;

        const { data, error } = await supabaseAdmin
            .from('chapters')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Chapter not found' });
            }
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Update chapter error:', error);
        res.status(500).json({ error: 'Failed to update chapter' });
    }
});

// Reorder chapters (editors only)
router.put('/reorder/:notebookId', requireEditor, async (req, res) => {
    try {
        const { notebookId } = req.params;
        const { chapters } = req.body; // Array of { id, order_index }

        if (!Array.isArray(chapters)) {
            return res.status(400).json({ error: 'Chapters array is required' });
        }

        // Update each chapter's order
        for (const chapter of chapters) {
            await supabaseAdmin
                .from('chapters')
                .update({ order_index: chapter.order_index })
                .eq('id', chapter.id)
                .eq('notebook_id', notebookId);
        }

        res.json({ message: 'Chapters reordered successfully' });
    } catch (error) {
        console.error('Reorder chapters error:', error);
        res.status(500).json({ error: 'Failed to reorder chapters' });
    }
});

// Delete chapter (editors only)
router.delete('/:id', requireEditor, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('chapters')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error('Delete chapter error:', error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
});

export default router;
