import {Pool} from 'pg';


export const pool: Pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

export async function setUpDate(): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(`
           CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL
           )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                price INTEGER
            )
        `);

        await client.query(`
           CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                menu_id INT NOT NULL,
                reservation_date DATE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (menu_id) REFERENCES menus(id)
            )
        `);

    } catch (error) {
        console.error('Error setting up table:', error);
    } finally {
        client.release();
    }
}

async function getUsers(): Promise<any> {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users');
        return result.rows;
    } catch (error) {
        console.error('Error getting users:', error);
    } finally {
        client.release();
    }
}

