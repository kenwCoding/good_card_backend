import express from 'express';

const router = express.Router()

router.get('/', function (req, res) {
    res.send('Source Server Health check success.');
})

export default router

