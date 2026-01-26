import { VercelRequest, VercelResponse } from '@vercel/node';
import login from '../../src/handlers/auth/login';
import signup from '../../src/handlers/auth/signup';
import me from '../../src/handlers/auth/me';
import forgotPassword from '../../src/handlers/auth/forgot-password';
import resetPassword from '../../src/handlers/auth/reset-password';
import verifyEmail from '../../src/handlers/auth/verify-email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { action } = req.query;

    // action is a string or string[]
    const actionName = Array.isArray(action) ? action[0] : action;

    try {
        switch (actionName) {
            case 'login':
                return await login(req, res);
            case 'signup':
                return await signup(req, res);
            case 'me':
                return await me(req, res);
            case 'forgot-password':
                return await forgotPassword(req, res);
            case 'reset-password':
                return await resetPassword(req, res);
            case 'verify-email':
                return await verifyEmail(req, res);
            default:
                return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error: any) {
        console.error(`Error in auth handler [${actionName}]:`, error);
        // Even if the sub-handler crashed, try to return a JSON response
        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
}
