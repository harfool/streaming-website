import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
app.get('/' , (req , res)=>{
    res.send('well done harfool')
})
app.get('/instagram' , (req ,res)=>{
    res.send("you are not forget")
})
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
    
}))

app.use(express.json({limit : '16kb'}))
app.use(express.urlencoded({extended :true , limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


export default app