// require('dotenv').config({path: '../.env'})
import connectDB from './db/index.js';
import dotenv from 'dotenv'
import { config } from 'dotenv'
import app from './app.js';
config({ path: './.env' })



const Port = process.env.PORT || 8000 
connectDB()
.then(()=>{
  app.listen(Port, ()=>{
  console.log(`server is running at port : ${Port}`)
  })
})
.catch((err)=>{
console.log('mongo db connection failed' ,err)
})












/*
// iife another way to connect dataBase
const app = express();
const MongoUrl = process.env.MONGO_URL;
const Port = process.env.PORT || 8000 
 
(async () => {
    try {
     await mongoose.connect(`${MongoUrl}/${DB_NAME}`);
      app.on("error ", (err) => {
        console.log(" error", err);
        throw err;
      });
      const app = any
      app.listen(Port , ()=>{
        console.log(`app listenig on ${Port}`  )
      })
    } catch (error) {
      console.log("Error", error);
      throw error;
    }
  })();
  */
