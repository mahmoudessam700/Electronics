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

    switch (actionName) {
        case 'login':
            return login(req, res);
        case 'signup':
            return signup(req, res);
        case 'me':
            return me(req, res);
        case 'forgot-password':
            return forgotPassword(req, res);
        case 'reset-password':
            return resetPassword(req, res);
        case 'verify-email':
            return verifyEmail(req, res);
        default:
            return res.status(404).json({ error: 'Endpoint not found' });
    }
}
