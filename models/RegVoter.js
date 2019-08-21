var mongoose= require('mongoose');


var VoterSchema= new mongoose.Schema({
    adhar_id: {
        type: Number
    },
    name: {
        type: String
    },
    dob: {
        type: String
    },
    phone: {
        type: String,
        unique: true
    },
    email: {
        type: String,
    },
    address: {
        type: String
    },
    constituency: {
        type: String
    },
    gender: {
        type: String
    },
    password: {
    	type: String
    },
    secret: {
    	type: String
    }
});


module.exports = mongoose.model('RegVoter', VoterSchema);
