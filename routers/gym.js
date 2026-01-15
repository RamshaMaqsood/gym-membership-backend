import express from 'express'
import {GymModel} from '../models/gym.js'
import {ManagerModel} from '../models/manager.js'

const router = express.Router()

router.post('/create', async(req, res) => {
  const gym = new GymModel({ name: req.body.gym.name });
  await gym.save();
  const manager = new ManagerModel({ name: req.body.manager.name,
    email: req.body.manager.email,
    password : req.body.manager.password,
    gym : gym
  });
  await manager.save();
  
  res.send('ok')
})



export default router;
