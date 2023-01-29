import express from 'express';
import argon2 from 'argon2';
import { UserModel } from '../models';
import { checkAuth } from '../middlewares';

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
            console.error('User already exist')
            throw new Error('User already exist')
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

userRouter.post('/sample', checkAuth, async (req, res, next) => {
    try {
        const { body } = req
        const { username, password, role, provider } = body

        console.log('Do sthing else here');

        return res.status(200).json({ message: 'Authorized' })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message})
    }
})

export { userRouter };
