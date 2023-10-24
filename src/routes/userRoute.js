import express from 'express';
import argon2 from 'argon2';
import { UserModel, CardModel } from '../models';
import { checkAuth } from '../middlewares';
import fetch from 'cross-fetch';
import { invalidUserInfo } from '../utils/constants';

const userRouter = express.Router();

/** NOTE: Register
 * @param username
 * @param password
 * @param role
 * @param provider
 * @returns {message, userInfo}
 * @summary Regist new User
 */
userRouter.post('/register', async (req, res, next) => {
    try {
        const { body } = req
        const { username, password, role, provider } = body

        // Check if user exist
        const user = await UserModel.findOne({
            username: username,
            role: role,
            provider: provider
        })

        // Error Handling
        if (user) {
            console.log('User already exist')
            return res.status(400).json({ message: 'User already exist', userInfo: invalidUserInfo })
        }

        // Login Handling
        if (provider === 'local') {
            // Password
            await UserModel.insertMany([{
                username: username,
                password: await argon2.hash(password),
                role: role,
                provider: provider,
            }])
        } else {
            // Non-password
            await UserModel.insertMany([{
                username: username,
                role: role,
                provider: provider,
            }])
        }

        return res.status(200).json({ message: 'Account Create Success', userInfo: { username, role, provider } })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message, userInfo: invalidUserInfo })
    }
})

/** NOTE: Login
 * @param username
 * @param password
 * @param role
 * @param provider
 * @returns {message, userInfo, accessToken}
 * @summary: Login to get new access token and refresh token
 */
userRouter.post('/login', async (req, res, next) => {
    try {
        const { username, password, role, provider } = req.body

        // Call Auth backend to get new tokens and userInfo
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

        // Error Handling
        if (loginResult.status === 403) {
            const { message } = await loginResult.json()
            return res.status(403).json({ message, userInfo: invalidUserInfo })
        }

        if (loginResult.status !== 200) {
            const { message } = await loginResult.json()
            return res.status(400).json({ message, userInfo: invalidUserInfo })
        }

        // Retrive Data
        const { refreshToken, accessToken, userInfo } = await loginResult.json()

        // Save Refresh Token to Cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
        })

        console.log(username, 'Login Success');

        return res.status(200).json({ message: 'Login Success', userInfo, accessToken })
    } catch (e) {
        console.error('Unable to login: ', e);
        return res.status(403).json({ message: e.message, userInfo: invalidUserInfo })
    }
})

/** NOTE: Test Auth Route
 * @param userInfo
 * @param accessToken
 * @returns {message, userInfo, accessToken}
 * @summary: Try to do sth on backend that needs Auth
 */
userRouter.post('/user_auth', checkAuth, async (req, res, next) => {
    try {
        const { userInfo, accessToken } = req

        console.log('Do sthing else here');

        return res.status(200).json({ message: 'Authorized', userInfo, accessToken })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message, userInfo: invalidUserInfo, accessToken: '' })
    }
})

/** NOTE: Logut
 * @returns {message, userInfo, accessToken}
 * @summary: Logout and remove Auth tokens
 */
userRouter.post('/logout', async (req, res, next) => {
    try {
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: 'Logouted' })
    } catch (e) {
        console.error('Unable to create user: ', e);
        return res.status(400).json({ message: e.message })
    }
})

export { userRouter };
