const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true,
        unique : true
    },
    contact : {
        type : String,
        require : true,
        unique : true
    },
    state : {
        type : String,
        require : true
    },
    city : {
        type : String,
        require : true
    },
    date : {
        type : Date,
        require : true
    },
    time : {
        type : String,
        require : true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;