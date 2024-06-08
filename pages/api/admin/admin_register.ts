import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from 'next'
import cookie from  'cookie';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;

export default async function Handler(req: NextApiRequest,res: NextApiResponse) {
    if(req.method == 'POST'){
        const {name,email,password} = req.body;

        if(!email || !password || !name){
            return res.status(400).json({message: 'Please fill all fields'})
        }

        if(!email.includes('@')) {
            return res.status(400).json({message: 'Invalid email address'})
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
            const adminUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    isAdmin: true,
                }
            });
            
            if(!secret) {
                throw new Error('Secret is undefined');
            }
            const token = jwt.sign({userId: adminUser.id,email: adminUser.email,},secret,{expiresIn: '1h'});
            const refreshToken = jwt.sign({userId :adminUser.id},secret,{expiresIn: '7d'});

            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: adminUser.id,
                }
            })

            res.setHeader('Set-Cookie', [
                cookie.serialize('token',token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    maxAge: 60 * 60,
                    sameSite: 'strict',
                    path: '/',
                }),
                cookie.serialize('refreshToken',refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    maxAge: 60 * 60 * 24 * 7,
                    sameSite: 'strict',
                    path: '/',
                })
            ])
            res.status(201).json({adminUser})
        } catch(error) {
            console.error(error);
            res.status(500).json({message: 'Error creating user'})
        }
    } else {
        res.status(405).json({message: 'Method not allowed'})
    }
}