import type { Request, Response, NextFunction } from 'express';
import { getSession } from './session';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.signedCookies.session;

    if (!token) {
        return res.status(401).json({ error: "not logged in" });
    }

    const session = getSession(token);

    if (!session) {
        return res.status(401).json({ error: "session expired or invalid" });
    }

    req.userId = session.userId;
    next();
}
