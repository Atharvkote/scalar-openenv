const Contact = require('../database/models/contact-model');

const newContact = async(req,res,next)=>{
    try {
        const {name,email,phone,message} = req.body;
        if(!name || !email || !phone || !message){
            return res.status(400).json({message:'Please fill in all fields'});
        }
        await Contact.create({name,email,phone,message});
        return res.status(201).json({message:'Message send successfully'});
    } catch (error) {
        next(error);
    }
}

// GET ALL CONTACT
const getAllContact = async(req,res,next)=>{
    try {
        
        const contacts = await Contact.findAll();
        return res.status(200).json(contacts);

    } catch (error) {
        next(error);
    }
}

module.exports = {
    newContact,
    getAllContact,

}