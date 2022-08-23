const pageNotFound = (req,res,next)=>{
    res.status(404).json({
        message:"page not found"
    });
};

const errorHandler = (error,req,res,next)=>{
    res.status(error.status || 500).json({
        status:"error",
        message: error.message
    });
}

module.exports = {
    pageNotFound,
    errorHandler
}
