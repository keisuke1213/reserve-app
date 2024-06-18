import { NextApiRequest,NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET;

export default async function handler(req: NextApiRequest,res: NextApiResponse) {
    const {token} = req.body;

    if(!token || !secret) {
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const decoded = jwt.verify(token,secret) as {userId: number};
        const user = await prisma.user.findUnique({
            where: {id: decoded.userId},
        });

        if(!user) {
            return res.status(401).json({message: 'Unauthorized'})
        }

        res.status(200).json({user});
    } catch(error) {
        res.status(401).json({message: 'Invalid Token'})
    }
}