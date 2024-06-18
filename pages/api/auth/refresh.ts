import { NextApiRequest,NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import cookie from 'cookie';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
    const {refreshToken} = req.cookies;

    if(!refreshToken || !secret) {
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const decoded = jwt.verify(refreshToken, secret) as {userId: number};
        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                id: decoded.userId,
                token: refreshToken
            },
        });

        if(!storedToken || storedToken.userId !== decoded.userId) {
            return res.status(401).json({message: 'Unauthorized'})
        }

        const user = await prisma.user.findUnique({
            where: {id: decoded.userId},
        });

        if(!user) {
            return res.status(401).json({message: 'Unauthorized'})
        }

        const newToken = jwt.sign({userId: user.id, email: user.email}, secret, {expiresIn: '1h'});
        const newRefreshToken = jwt.sign({userId: user.id}, secret, {expiresIn: '7d'});

        await prisma.refreshToken.update({
            where: {token: refreshToken, id: decoded.userId},
            data: {token: newRefreshToken}
        });

        res.setHeader('Set-Cookie', [
            cookie.serialize('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60, // 1 hour
                sameSite: 'strict',
                path: '/',
            }),
            cookie.serialize('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                sameSite: 'strict',
                path: '/',
            }),
        ]);

        res.status(200).json({user})

    } catch (error) {
        res.status(401).json({message: 'Invalid Token'})
    }
}