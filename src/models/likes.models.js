import mongoose , { Schema } from 'mongoose';
import { Comments } from './comments.models';

const likesSchema = new Schema({
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    comment : {
        type : Schema.Types.ObjectId,
        ref : "Comment"
    },
    tweet : {Schema.Types.ObjectId,
    ref : "Tweet"
    },
    likeBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }

}, {timestamps : true})


export const Like = mongoose.model("Like" , likesSchema)