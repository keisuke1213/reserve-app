import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;

export default async function Handler(req: NextApiRequest,res: NextApiResponse) {
    if(req.method === 'POST') {
        const {name, email,password ,role} = req.body;

        if(!name || !email || !password || !role) {
            return res.status(400).json({message: 'Please fill all fields'})
        }

        if(!email.includes('@')) {
            return res.status(400).json({  message: 'Invalid email address'}) // returnを追加
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if(existingUser) {
            return res.status(400).json({message: 'User already exists'})
        }

        const hashedPassword = bcrypt.hashSync(password,10)

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role
                }
            });

            if (!secret) {
                throw new Error('Secret is undefined');
            }
            const token = jwt.sign({userId: user.id, email: user.email, role: user.role}, secret, {expiresIn: '1h'});
            const refreshToken = jwt.sign({userId: user.id}, secret, {expiresIn: '7d'});

            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                }
            })

            res.status(201).json({user,token,refreshToken})
        } catch(error) {
            console.error(error);
            res.status(500).json({message: 'Error creating user'})
        }
    } else {
        res.status(405).json({message: 'Method not allowed'}) 
    }
}