import express from 'express'
import {ManagerModel} from '../models/manager.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/login', async(req, res) => {
  const manager= await ManagerModel.findOne({ email: req.body.email, password:req.body.password}).exec();
  if(!manager){
    res.status(401).send('Invalid login credentials');
  }
 
  const token = jwt.sign({ id: manager._id, role: 'manager'}, process.env.JWT_SECRET);
  res.send(token)
})



export default router;
