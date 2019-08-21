var mongoose= require('mongoose');
;

//user model schema
const UserSchema = new mongoose.Schema({
    adhar_id: {
        type: Number
    },
    Name: {
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
    }
});


// Export user model
module.exports = mongoose.model('User', UserSchema);

