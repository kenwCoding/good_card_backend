import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes';
import { corsConfig } from './utils/constants';

process.env.TZ = 'Etc/UTC';

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsConfig))
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_CONNECTION_STRING || "mongodb://root:password@127.0.0.1:27018",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'good_card',
    autoIndex: true,
})

app.use('/', router)

app.use(express.static('public'));

const server = app.listen(process.env.PORT || '3001', function () {
    const port = server.address().port
    console.log('Server start time is:', new Date());
    console.log(`Listioning to Server http://localhost:${[port]}`)
})