import { randomBytes } from 'crypto';
import { db } from '../database/connection';

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateSessionToken(): string {
    return randomBytes(32).toString('hex');
}

export function createSession(userId: number): { token: string; expiresAt: Date } {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    db.prepare(`
        INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)
    `).run(token, userId, expiresAt.toISOString());

    return { token, expiresAt };
}

export function getSession(token: string): { userId: number } | null {
    const session = db.prepare(`
        SELECT user_id, expires_at FROM sessions WHERE id = (?)
    `).get(token) as { user_id: number; expires_at: string } | undefined;

    if (!session) return null;

    if (new Date(session.expires_at).getTime() <= Date.now()) {
        db.prepare(`DELETE FROM sessions WHERE id = (?)`).run(token);
        return null;
    }

    return { userId: session.user_id };
}

export function deleteSession(token: string): void {
    db.prepare(`DELETE FROM sessions WHERE id = (?)`).run(token);
}

export function deleteExpiredSessions(): void {
    db.prepare(`DELETE FROM sessions WHERE expires_at <= (?)`).run(new Date().toISOString());
}
