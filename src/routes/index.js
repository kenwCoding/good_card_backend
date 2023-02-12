import express from 'express';
import { userRouter } from './userRoute';

const router = express.Router()

router.get('/', function (req, res) {
    res.send('Source Server Health check success.');
})

router.use('/user', userRouter)

export default router

