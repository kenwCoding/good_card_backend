import express from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
const userRouter = express.Router();

const ACCESS_TOKEN_TIME = 10
const REFRESH_TOKEN_TIME = 300

/* Create User */
userRouter.post('/', async (req, res, next) => {
    try {
        const { body } = req
        const { username, password, role, provider } = body
        
        const payload = { 
            username: username,
            role: role,
            provider: provider
        }

        //TODO: Do it on Auth side
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: `${ACCESS_TOKEN_TIME}s`})
        //TODO: Do it on Auth side
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: `${REFRESH_TOKEN_TIME}s`})

        if (provider === 'local') {
            await UserModel.insertMany([{
                username: username,
                password: await argon2.hash(password),
                role: role,
                provider: provider,
                refreshToken: refreshToken,
            }])
        } else {
            await UserModel.insertMany([{
                username: username,
                role: role,
                provider: provider,
                refreshToken: refreshToken,
            }])
        }

        //TODO: Do it on Auth side
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_TIME * 1000
        })

        console.log('User created: ', payload.username);
        //TODO: Do it on Auth side
        return res.json({ accessToken })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json(e)
    }
})

export { userRouter };
