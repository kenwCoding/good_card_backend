import express from 'express';
import argon2 from 'argon2';
import { UserModel, CardModel } from '../models';
import { checkAuth } from '../middlewares';
import fetch from 'cross-fetch';
import { invalidUserInfo } from '../utils/constants';

const cardRouter = express.Router();

/** NOTE: Register
 * @param username
 * @param password
 * @param role
 * @param provider
 * @returns {message, userInfo}
 * @summary Regist new User
 */
cardRouter.post('/add', async (req, res, next) => {
    try {
        return res.status(200).json({ message: 'Card Added' })
    } catch (e) {
        console.error('Unable to add card: ', e);
        return res.status(400).json({ message: e.message, userInfo: invalidUserInfo })
    }
})

export { cardRouter };
