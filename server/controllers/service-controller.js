const { default: mongoose } = require('mongoose');
const Service = require('../database/models/service-model');


// -----------------
// GET ALL Services
// -----------------
const services = async(req,res,next)=>{
    try {
        const services = await Service.find();
        // If no services
        if(services.length === 0){
            res.status(404).json({message: "No services found"});
        }
        // If services found
        return res.status(200).json(services);
    } catch (error) {
        next(error);
    }
}

// ------------------
// GET Single Service
// -----------------

const singleService = async(req,res,next)=>{
    try {
        
        const {id} = req.param;
        if(!mongoose.isValidObjectId(id)){
            return res.status(400).json({message: "Invalid service id"});
        }
        const service = await Service.findById(id);
        // If service not found
        if(!service){
            return res.status(404).json({message: "Service not found"});
        }
        // If service found
        return res.status(200).json(service);
    } catch (error) {
        next(error);
    }
}


module.exports={
    services,
    singleService
}