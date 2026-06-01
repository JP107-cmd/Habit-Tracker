import Database from 'better-sqlite3';

        const db = new Database("./database/database.db");

        const habit = db.prepare(`
            SELECT name FROM habits 
            WHERE id = (?) AND user_id = (?);
        `).get(2, 1);

        console.log(habit)

        db.close();

db.close()