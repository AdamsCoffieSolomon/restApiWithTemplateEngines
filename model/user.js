const mongoose = require('mongoose');
const { Schema } = mongoose;
const usermodel = new Schema({
    name: { type: String },
    email: {
        type: String,
        unique: true,
    },
    password: { type: String }
});
module.exports = mongoose.model('user', usermodel)