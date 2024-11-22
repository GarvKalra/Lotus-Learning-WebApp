const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    institutionCode: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    classId: {
        type: String,
    }, 
    sentOn: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['Pending', 'Accepted'], 
        default: 'Pending'
    },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' }
}, {
    timestamps: true
});

const Students = mongoose.model('Students', studentSchema);
module.exports = Students;
