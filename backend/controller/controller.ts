import Database from 'better-sqlite3';
import { sub } from 'date-fns';

const getId = (cookie: any) => {
    try {
    return cookie.user.id;
    } catch (e) {
        return null;
    }
}

export const login = (req: any, res: any) => {

    const name : string = req.body.name;

    if (!name) res.status(400).json({error: "bad request"});

    try {
    const db = new Database("./database/database.db");
    const insert = db.prepare(`
        INSERT OR IGNORE INTO users (name) VALUES (?)
    `);
    insert.run(name);

    const user = db.prepare(`
         SELECT id FROM USERS WHERE name = (?);
    `).get(name);

     res.cookie("session", {user}, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
            path: "/",
        });


    db.close();   
        
    return res.status(200).json({status: "login successful"});
    } catch (e) {
        return res.status(500).json({error: e});
    }   
}

export const logout = (req: any, res: any) => {
    try {
    res.clearCookie('session')
    return res.status(200).json({status: 'successfully logged out'});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const checkLogin = (req: any, res: any) => {

    const id : number = getId(req.cookies.session);

    if (id ===  null) {
        return res.status(401).json({error: "user not logged into any user profile"});
    }

    try{
        const db = new Database("./database/database.db");
        const user  = db.prepare(`
            SELECT name FROM users WHERE id = (?)
        `).get(id);

        if (!user) {
            return res.status(401).json({error: "user not logged into any user profile"});
        }

        db.close()

        return res.status(200).json({id: id});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const getHabits = (req: any, res: any) => {

    const id : number = getId(req.cookies.session);

    if (id ===  null) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    try{
        const db = new Database("./database/database.db");
        const habits = db.prepare(`
            SELECT id, name, description, icon, createdAt FROM habits
            WHERE user_id = (?);
        `).all(id);

        db.close()

        return res.status(200).json({habits: habits});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const createNewHabit = (req: any, res: any) => {

    const id : number = getId(req.cookies.session)
    const name : string = req.body.name;
    const description : string = req.body.description;
    const icon : string = req.body.icon;

    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
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
    const db = new Database("./database/database.db");

    const insert = db.prepare(`
        INSERT OR IGNORE INTO habits (user_id, name, description, icon) VALUES (?, ?, ?, ?)
    `);
    insert.run(id, name, description, icon);

    return res.status(200).json({status: "habit successfully uploaded"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}   

export const getHabit = (req: any, res: any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.params.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

        const habit = db.prepare(`
            SELECT name, description, icon, createdAt FROM habits 
            WHERE id = (?) AND user_id = (?);
        `).get(habitId, id);

        db.close();
        return res.status(200).json(habit);
    } catch (e) {
        return res.status(500).json({error: e});
    }
}   

export const updateHabit = (req: any, res: any) => {

    
    const name : string = req.body.name;
    const description : string = req.body.description;
    const icon : string = req.body.icon;
    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.params.id;
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
        const db = new Database("./database/database.db");

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

        db.close();
        return res.status(200).json({status: "habit successfully updated"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const deleteHabit = (req: any, res: any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.params.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

        const habit = db.prepare(`
            SELECT name FROM habits 
            WHERE id = (?) AND user_id = (?);
        `).get(habitId, id);

        if (!habit) {
            return res.status(400).json({error: "no habit found"});
        }

        const update = db.prepare(`
            DELETE FROM habits
            WHERE id = (?) AND user_id = (?)
        `)
        update.run(habitId, id);

        db.close();
        return res.status(200).json({status: "habit successfully deleted"});
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

export const recordCompletion = (req : any, res : any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.body.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

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
            WHERE id = (?) AND completion_date = (?)
        `).get(habitId, today)


        if (exists != null) {
            return res.status(409).json({status: "habit already completed today"})
        }
        
        const insert = db.prepare(`
            INSERT OR IGNORE INTO habit_completions (habit_id) VALUES (?)
        `)

        insert.run(habitId)

        db.close();
        return res.status(200).json({status: "habit completion successfully recorded"});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const isCompleted = (req : any, res : any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.params.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

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


        db.close();
        return res.status(200).json({completedToday : (!! exists)});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const stats = (req : any, res : any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.params.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

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

        db.close();
        return res.status(200).json({stats});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}

export const undoCompletion = (req : any, res : any) => {

    const id : number = getId(req.cookies.session);
    if (!id) {
        return res.status(401).json({error: "access denied, not logged into any user profile"});
    }

    const habitId : number = req.body.id;
    if (!habitId) {
        return res.status(400).json({error: "bad request"});
    }

    try {
        const db = new Database("./database/database.db");

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
            WHERE id = (?) and completion_date = (?)
        `).get(habitId, today)


        if (exists != null) {
            return res.status(409).json({status: "habit already completed today"})
        }
        
        const insert = db.prepare(`
            DELETE FROM habit_completions
            WHERE habit_id = (?) AND completion_date = (?)
        `)

        insert.run(habitId, today)

        db.close();
        return res.status(200).json({status: "habit completion successfully undone"});
    } catch (e) {
        return res.status(500).json({error: e});
    }

}