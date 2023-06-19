const { ValidationError }= require('joi');
const CustomErrorHandler = require('../services/CustomErrorHandler');

const errorHandler = (err,req,res,next)=>{
    let statusCode=500;
    let data={
        message : " Internal server error",
        originalMessage : err.message
    }

    if(err instanceof ValidationError){
        statusCode=422,
        data ={
            message: err.message
        }
    }

    if(err instanceof CustomErrorHandler){
        statusCode=err.statusCode,
        data ={
            message: err.message
        }
    }


    res.status(statusCode).json(data);
}

module.exports=errorHandler;