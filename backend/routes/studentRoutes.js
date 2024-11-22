const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Student = require('../models/Students.js');
const router = express.Router();
const User = require("../models/User.js");
const Students = require('../models/Students.js');



const storage = multer.memoryStorage();
const upload = multer({ storage });


// POST route for file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { institutionCode } = req.query;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Read the Excel file
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const emails = data.map((row) => row.Email);

    // Check for duplicate emails within the uploaded Excel file
    const emailSet = new Set();
    const duplicateEmails = emails.filter((email) => {
      if (emailSet.has(email)) {
        return true;
      }
      emailSet.add(email);
      return false;
    });

    if (duplicateEmails.length > 0) {
      return res.status(400).json({
        message: `The uploaded file contains duplicate emails: ${duplicateEmails.join(', ')}`,
      });
    }

    // Check for emails that already exist in the database
    const existingEmails = await Student.find({ email: { $in: emails } }).select('email');
    const existingEmailList = existingEmails.map((student) => student.email);

    if (existingEmailList.length > 0) {
      return res.status(400).json({
        message: `The following emails already exist in the database: ${existingEmailList.join(', ')}`,
      });
    }

    // Prepare entries for saving
    const newStudents = emails.map((email) => ({
      email,
      institutionCode,
      sentOn: new Date(),
      status: 'Pending',
    }));

    // Bulk insert entries
    await Student.insertMany(newStudents);

    res.status(200).json({
      message: `File uploaded successfully.`,
      students: newStudents,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
});

router.get('/:institutionCode', async (req, res) => {
  try {
    const institutionCode = req.params.institutionCode;

    const students = await Student.find({ institutionCode }).sort({ email: 1 }); 
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// UPDATE student status
router.post('/update-status', async (req, res) => {
  console.log("route accessed");
  try {

    const { email } = req.body;
    console.log("Received email for update:", email); // Confirm email is received

    const updatedStudent = await Students.findOneAndUpdate(
      { email: email },  // find by email
      {
        $set: {
          status: "Accepted"
        }
      },
      {
        new: true
      }
    );

    if (!updatedStudent) {
      console.log("No student found with email:", email);
      return res.status(404).json({
        success: false,
        error: `No student found with email: ${email}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to 'accepted' for ${email}`,
      data: {
        student: updatedStudent
      }
    });

  } catch (error) {
    console.log("Error in update-status route:", error); // Log error details
    return res.status(400).json({
      success: false,
      error: error.message,
      details: 'Error updating student status'
    });
  }
});

// router.get('/get-emails', async (req, res) => {
//   try {
//     const students = await Students.find({}, 'email'); // Fetch only the 'email' field
//     const emails = students.map(student => student.email); // Extract emails into an array
//     res.status(200).json({ success: true, emails });
//   } catch (error) {
//     console.error('Error fetching student emails:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

router.get('/verify-email/:email', async (req, res) => {
  try {
    const email = req.params.email; // Extract email from the route parameter
    console.debug('Email to verify:', email); // Debug log for email

    // Use Mongoose's `findOne` since you expect a single match for a unique email
    const student = await Students.findOne({ email }); 

    if (student) {
      return res.status(200).json({ success: true, student });
    } else {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
  } catch (error) {
    console.error('Error checking email existence:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});


router.get('/test', (req, res) => {
  res.json({ message: 'Students route working' });
});


module.exports = router;