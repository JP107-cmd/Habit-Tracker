import type { Request, Response } from 'express';
import { sub } from 'date-fns';
import { db } from '../database/connection';
import { hashPassword, verifyPassword } from '../auth/password';
import { createSession, deleteSession, SESSION_TTL_MS } from '../auth/session';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt silently truncates input beyond 72 bytes

function setSessionCookie(res: Response, token: string) {
    res.cookie("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        signed: true,
        path: "/",
        maxAge: SESSION_TTL_MS,
    });
}

export const signup = async (req: Request, res: Response) => {

    const username : string = req.body.username;
    const password : string = req.body.password;

    if (!username || !password) {
        return res.status(400).json({error: "username and password are required"});
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({error: `password must be at least ${MIN_PASSWORD_LENGTH} characters`});
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({error: `password must be at most ${MAX_PASSWORD_LENGTH} characters`});
    }

    try {
        const existing = db.prepare(`
            SELECT id FROM users WHERE username = (?)
        `).get(username);

        if (existing) {
            return res.status(409).json({error: "username already taken"});
        }

        const passwordHash = await hashPassword(password);

        const insert = db.prepare(`
            INSERT INTO users (username, password_hash) VALUES (?, ?)
        `);
        const result = insert.run(username, passwordHash);
        const userId = Number(result.lastInsertRowid);

        const { token } = createSession(userId);
        setSessionCookie(res, token);

        return res.status(201).json({status: "signup successful"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const login = async (req: Request, res: Response) => {

    const username : string = req.body.username;
    const password : string = req.body.password;

    if (!username || !password) {
        return res.status(400).json({error: "username and password are required"});
    }

    try {
        const user = db.prepare(`
            SELECT id, password_hash FROM users WHERE username = (?)
        `).get(username) as { id: number; password_hash: string } | undefined;

        if (!user) {
            return res.status(401).json({error: "invalid username or password"});
        }

        const valid = await verifyPassword(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({error: "invalid username or password"});
        }

        const { token } = createSession(user.id);
        setSessionCookie(res, token);

        return res.status(200).json({status: "login successful"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const logout = (req: Request, res: Response) => {
    try {
        const token = req.signedCookies.session;
        if (token) {
            deleteSession(token);
        }
        res.clearCookie('session', { path: "/" });
        return res.status(200).json({status: 'successfully logged out'});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const checkLogin = (req: Request, res: Response) => {
    return res.status(200).json({id: req.userId});
}

export const getHabits = (req: Request, res: Response) => {

    const id = req.userId;

    try{
        const habits = db.prepare(`
            SELECT id, name, description, icon, createdAt FROM habits
            WHERE user_id = (?);
        `).all(id) as Array<{ id: number; name: string; description: string; icon: string; createdAt: string }>;

        const today = new Date().toLocaleDateString('en-CA');

        const countStmt = db.prepare(`
            SELECT COUNT(*) AS count FROM habit_completions WHERE habit_id = (?)
        `);
        const datesStmt = db.prepare(`
            SELECT completion_date FROM habit_completions
            WHERE habit_id = (?)
            ORDER BY completion_date DESC
        `);

        const enriched = habits.map((habit) => {
            const { count } = countStmt.get(habit.id) as { count: number };
            const dates = (datesStmt.all(habit.id) as Array<{ completion_date: string }>)
                .map((row) => row.completion_date);
            const dateSet = new Set(dates);

            let streak = 0;
            let cursor = new Date();
            while (dateSet.has(cursor.toLocaleDateString('en-CA'))) {
                streak++;
                cursor = sub(cursor, { days: 1 });
            }

            return {
                ...habit,
                completedToday: dateSet.has(today),
                currentStreak: streak,
                numberOfCompletions: count,
            };
        });

        return res.status(200).json({habits: enriched});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const createNewHabit = (req: Request, res: Response) => {

    const id = req.userId;
    const name : string = req.body.name;
    const description : string = req.body.description;
    const icon : string = req.body.icon;

    let missingFields: Array<string> = [];

    if (!name) {
        missingFields.push("name");
    }

    if (!description) {
        missingFields.push("description");
    }

    if (!icon) {
        missingFields.push("icon");
    }

    if (missingFields.length > 0) {
        return res.status(400).json({error: `missing fields: ${missingFields}`});
    }

    try {
    const insert = db.prepare(`
        INSERT OR IGNORE INTO habits (user_id, name, description, icon) VALUES (?, ?, ?, ?)
    `);
    insert.run(id, name, description, icon);

    return res.status(200).json({status: "habit successfully uploaded"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const getHabit = (req: Request, res: Response) => {

    const id = req.userId;

    const habitId : number = Number(req.params.id);
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name, description, icon, createdAt FROM habits
            WHERE id = (?) AND user_id = (?);
        `).get(habitId, id);

        return res.status(200).json(habit);
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const updateHabit = (req: Request, res: Response) => {

    const name : string = req.body.name;
    const description : string = req.body.description;
    const icon : string = req.body.icon;
    const id = req.userId;

    const habitId : number = Number(req.params.id);
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    let missingFields: Array<string> = [];

    if (!name) {
        missingFields.push("name");
    }

    if (!description) {
        missingFields.push("description");
    }

    if (!icon) {
        missingFields.push("icon");
    }

    if (missingFields.length > 0) {
        return res.status(400).json({error: `missing fields: ${missingFields}`});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?);
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        const update = db.prepare(`
            UPDATE habits
            SET
                name = (?),
                description = (?),
                icon = (?)
            WHERE id = (?) AND user_id = (?);
        `);
        update.run(name, description, icon, habitId, id);

        return res.status(200).json({status: "habit successfully updated"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const deleteHabit = (req: Request, res: Response) => {

    const id = req.userId;

    const habitId : number = Number(req.params.id);
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?);
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        // Remove the habit's completion records before the habit itself, since
        // habit_completions.habit_id references habits(id). Wrapped in a
        // transaction so both deletes succeed or neither does.
        const deleteHabitAndCompletions = db.transaction((habitId: number, userId: number) => {
            db.prepare(`
                DELETE FROM habit_completions WHERE habit_id = (?)
            `).run(habitId);
            db.prepare(`
                DELETE FROM habits WHERE id = (?) AND user_id = (?)
            `).run(habitId, userId);
        });
        deleteHabitAndCompletions(habitId, id);

        return res.status(200).json({status: "habit successfully deleted"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const recordCompletion = (req : Request, res : Response) => {

    const id = req.userId;

    const habitId : number = req.body.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?)
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        const today = new Date().toLocaleDateString('en-CA')
        const exists = db.prepare(`
            SELECT id FROM habit_completions
            WHERE habit_id = (?) AND completion_date = (?)
        `).get(habitId, today)


        if (exists != null) {
            return res.status(409).json({status: "habit already completed today"})
        }

        const insert = db.prepare(`
            INSERT OR IGNORE INTO habit_completions (habit_id) VALUES (?)
        `)

        insert.run(habitId)

        return res.status(200).json({status: "habit completion successfully recorded"});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const isCompleted = (req : Request, res : Response) => {

    const id = req.userId;

    const habitId : number = Number(req.params.id);
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?)
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        const today = new Date().toLocaleDateString('en-CA')

        const exists = db.prepare(`
            SELECT * FROM
            habit_completions
            WHERE habit_id = (?)
            AND completion_date = (?)
        `).get(habitId, today);

        return res.status(200).json({completedToday : (!! exists)});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const stats = (req : Request, res : Response) => {

    const id = req.userId;

    const habitId : number = Number(req.params.id);
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?)
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        let date = new Date();

        let streak : number = 0;

        while (true) {
            const habit = db.prepare(`
                SELECT *
                FROM habit_completions
                WHERE habit_id = (?)
                AND completion_date = (?)
            `).get(habitId, date.toLocaleDateString('en-CA'));

            if (habit == null) {
                break;
            }

            streak++;
            date = sub(date, {days : 1});
        }

        const count = db.prepare(`
            SELECT COUNT(*)
            FROM habit_completions
            WHERE habit_id = (?)
        `).get(habitId) as {'COUNT(*)': number};

        const stats = {
            currentStreak : streak,
            numberOfCompletions : count['COUNT(*)']
        }

        return res.status(200).json({stats});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const undoCompletion = (req : Request, res : Response) => {

    const id = req.userId;

    const habitId : number = req.body.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const habit = db.prepare(`
            SELECT name FROM habits
            WHERE id = (?) AND user_id = (?)
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        const today = new Date().toLocaleDateString('en-CA')

        const del = db.prepare(`
            DELETE FROM habit_completions
            WHERE habit_id = (?) AND completion_date = (?)
        `)

        const result = del.run(habitId, today)

        if (result.changes === 0) {
            return res.status(404).json({status: "no completion recorded for today"});
        }

        return res.status(200).json({status: "habit completion successfully undone"});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}
