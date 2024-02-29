const mongoose = require("mongoose");
const User = new mongoose.Schema ({
    Name: {
        type: String,
        reuire: true,
        minlength: 4,
    },
    PhoneNumber: {
        type: Number,
        require: true,
        unique: true,
    },
    Email: {
        type: String,
        require: true,
        unique: true,
    },
    Password: {
        type: String,
        validate:{
            validator: function (value) {
                return /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/.test(value);
            },
            message: 'Password must be at least 8 characters with one capital letter and one symbol.',
        },
    },
    Age: {
        type: Number,
    },
    Image: {
        type: String,
        require: false,
    },
    location: {
        coordinates: {
            default: [0,0],
        },
        address: String,
    },
    OTP: {
        type: String,
    },
    Image: {
        type: String,
        required: false,
    }
});
module.exports = mongoose.model('userSchema',User);