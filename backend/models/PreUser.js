const mongoose = require('mongoose');

const preuserSchema = new mongoose.Schema({
    institutionCode: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    sentOn: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Accepted'], 
        default: 'Pending'
    },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
    typeOfAccount: {type:String},
}, 
{
    timestamps: true
});

const PreUser = mongoose.model('PreUser', preuserSchema);
module.exports = PreUser;
