import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
   subscriber : {
    type : Schema.Types.ObjectId,
    ref : "User" //jo subscribe karta hai
   },
   channal : {
    type : Schema.Types.ObjectId,
    ref : "User" // jisko subscribe karta hai
   }
}, {timestamps : true})


export const Subscription = mongoose.model("Subscription" , subscriptionSchema)