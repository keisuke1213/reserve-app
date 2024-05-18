import { config } from 'dotenv';
config();
import {Pool} from 'pg';


export const pool: Pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

export async function setUpDate(): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query(`
           CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL
           )
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                price INTEGER,
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



