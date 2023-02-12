import express from 'express';
import argon2 from 'argon2';
import { UserModel } from '../models';
import { checkAuth } from '../middlewares';
import fetch from 'cross-fetch';

const userRouter = express.Router();

/* Create User */
userRouter.post('/', async (req, res, next) => {
    try {
        const { body } = req
        const { username, password, role, provider } = body

        const user = await UserModel.findOne({
            username: username,
            role: role,
            provider: provider
        })

        if (user) {
            console.log('User already exist')
            return res.status(400).json({ message: 'User already exist' })
        }

        if (provider === 'local') {
            await UserModel.insertMany([{
                username: username,
                password: await argon2.hash(password),
                role: role,
                provider: provider,
            }])
        } else {
            await UserModel.insertMany([{
                username: username,
                role: role,
                provider: provider,
            }])
        }

        return res.status(200).json({ message: 'Account Create Success' })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message})
    }
})

/* Login */
userRouter.post('/login', async (req, res, next) => {
    try {
        const { username, password, role, provider } = req.body
        
        // Login with payload
        const loginResult = await fetch(`${process.env.AUTH_SERVER_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role, provider }),
            withCredntials: true,
            credentials: 'include'
        })
        
        if (loginResult.status === 403) {
            const { message } = await loginResult.json()
            return res.status(403).json({ message })
        }

        if (loginResult.status !== 200) {
            const { message } = await loginResult.json()
            return res.status(400).json({ message })
        }

        const {refreshToken, accessToken} = await loginResult.json()

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })

        console.log(username, 'Login Success');

        return res.status(200).json({message: 'Login Success'})
    } catch (e) {
        console.error('Unable to login: ', e);
        return res.status(403).json(e)
    }
})

userRouter.post('/sample', checkAuth, async (req, res, next) => {
    try {
        console.log('Do sthing else here');

        return res.status(200).json({ message: 'Authorized' })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message})
    }
})

userRouter.post('/logout', async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: 'Logouted' })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message})
    }
})

export { userRouter };
