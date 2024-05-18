import {NextApiRequest, NextApiResponse} from 'next';
import {pool} from '../../lib/db';

export default async function register(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if(req.method === 'POST'){
        const {name, email, password, role} = req.body;
        try {
            const client = await pool.connect();
            const result = await client.query('INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, password, role]);
            const userId = result.rows[0].id;
            res.status(200).json({status: 'success', userId: userId });
            console.log('User registered successfully');
        } catch (error: any) {
            res.status(500).json({error: error.message});
        }
    } else {
        res.status(405).json({error: 'Method not allowed'});
    }
}
