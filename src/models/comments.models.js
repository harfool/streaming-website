import mongoose,  { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const commentsShema = new Schema({
  
    content :{
        type : String,
        required : true
    },
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }

},
    {timestamps : true}
)


export const Comments = mongoose.model("Commnets" , commentsShema)