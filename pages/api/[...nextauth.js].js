import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
 const prisma = new PrismaClient()

 export default NextAuth ({
    providers: [
        Providers.Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: {label: 'Password', type: "Password"}
            },
            authorize: async (credentials) => {
                const user = await prisma.user.findUnique({
                    where: {email: credentials.email}
                })
                if(user && bcrypt.compareSync(credentials.password, user.password)) {
                    return user
                } else {
                    return null
                }
            }
        })
    ],
    adapter: PrismaAdapter(prisma),
    callbacks: {
            session: async (session, user) => {
                session.userId = user.userId
                session.role = user.role
                return session
        }
    }
 })