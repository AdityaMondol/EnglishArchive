import { supabaseAdmin } from '../config/supabase.js';

// Verify JWT token and attach user to request
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        req.user = null;
        next();
    }
};

// Require authentication - must be used after verifyToken
export const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'You must be logged in to perform this action'
        });
    }
    next();
};

// Require editor role - must be used after verifyToken
export const requireEditor = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'You must be logged in to perform this action'
        });
    }

    try {
        const { data: editor, error } = await supabaseAdmin
            .from('editors')
            .select('id, is_active')
            .eq('user_id', req.user.id)
            .eq('is_active', true)
            .single();

        if (error || !editor) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to perform this action'
            });
        }

        req.isEditor = true;
        next();
    } catch (error) {
        console.error('Editor check error:', error);
        return res.status(500).json({
            error: 'Server error',
            message: 'Failed to verify permissions'
        });
    }
};

// Check if current user is an editor (non-blocking)
export const checkEditor = async (req, res, next) => {
    req.isEditor = false;

    if (!req.user) {
        return next();
    }

    try {
        const { data: editor } = await supabaseAdmin
            .from('editors')
            .select('id, is_active')
            .eq('user_id', req.user.id)
            .eq('is_active', true)
            .single();

        req.isEditor = !!editor;
        next();
    } catch (error) {
        next();
    }
};
