const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    uploadedOn: { type: Date, default: Date.now },
    institutionCode: { type: String, required: true },
    totalStudents: { type: Number, default: 0 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Students' }] // Link to students
  });
  
  module.exports = mongoose.model('File', FileSchema);