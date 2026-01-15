import mongoose from "mongoose";
import express from 'express';
import gymRouter from './routers/gym.js'
import managerRouter from './routers/manager.js'
import trainerRouter from './routers/trainer.js'
import memberRouter from './routers/member.js'
import scheduleRouter from './routers/schedule.js'
import reportRouter from './routers/report.js'
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

try {
  await mongoose.connect('mongodb://127.0.0.1:27017/gymMembership');
  console.log('mongodb is connected..');
} catch (error) {
  console.log('failed to connect to mongodb..');
}

const app = express()
const port = 3000

app.use(express.json());
app.use(cors())

app.use('/gyms', gymRouter)
app.use('/managers', managerRouter)
app.use('/trainers', trainerRouter)
app.use("/members", memberRouter);
app.use("/schedules", scheduleRouter);
app.use("/reports", reportRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})