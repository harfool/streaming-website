
const asyncHandler = (requestHandler) =>{
    (req , res ,next)=>{
        
        Promise.resolve(requestHandler(req , res ,next))
        .catch((err)=>{
            next(err)
        })
    }

}




    export default asyncHandler


    /*
    explaination 
    const asyncHandler = ()=>{} 
    const asyncHandler = (function)=>{(req , res , next)=>{try{}catch(){}}} // higher order function 
    const asyncHandler = (fn) => async ()=>{} 


        const asyncHandler = (fun)=>  async (req , res , next)=>{
            try{
             await fun(req, res ,next)
            }catch(err){
           res.status(err.code || 500).json({
            success : false,
            message : err.message
           })
            }
        }


    */
