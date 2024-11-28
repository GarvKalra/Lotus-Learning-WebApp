const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const PreUser = require('../models/PreUser.js');
const router = express.Router();
const User = require("../models/User.js");
const File = require('../models/File.js')
const Enrollment = require("../models/Enrollment.js");
const { getLogger } = require('nodemailer/lib/shared/index.js');
const logger = require('../logger.js')


const storage = multer.memoryStorage();
const upload = multer({ storage });





// POST route for file upload
router.post('/uploads', upload.single('file'), async (req, res) => {
  console.log('File upload route triggered');
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
    const existingPreUsers = await PreUser.find({ email: { $in: emails } });
    const existingEmailList = existingPreUsers.map((preUser) => preUser.email);

    if (existingEmailList.length > 0) {
      return res.status(400).json({
        message: `The uploaded file contains emails that already exist in the database: ${existingEmailList.join(', ')}`,
      });
    }

    // Create a new file record in the database
    const newFile = new File({
      fileName: file.originalname,
      institutionCode,
      uploadedAt: new Date(),
      preUserCount: data.length,
    });
    await newFile.save();

    // Prepare new users
    const newPreUsers = emails.map((email) => ({
      email,
      institutionCode,
      sentOn: new Date(),
      status: 'Pending',
      file: [newFile._id],
    }));

    // Insert new users into the database
    const savedNewPreUsers = await PreUser.insertMany(newPreUsers);

    // Update the file with all linked users
    newFile.preUsers = savedNewPreUsers.map((pu) => pu._id);
    await newFile.save();

    res.status(200).json({
      message: 'File uploaded successfully.',
      file: newFile,
      preUsers: savedNewPreUsers,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
});


router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find the file and delete it
    const deletedFile = await File.findByIdAndDelete(fileId);

    if (!deletedFile) {
      return res.status(404).json({ message: 'File not found.' });
    }

    // Find users associated with the file
    const preUsersToDelete = await PreUser.find({ file: fileId });
    const preUserEmails = preUsersToDelete.map(preUser => preUser.email);

    // Delete the users
    const deletedPreUsers = await PreUser.deleteMany({ file: fileId });

    // Find users with matching emails
    const usersToDelete = await User.find({ email: { $in: preUserEmails } });
    const userIds = usersToDelete.map(user => user._id); // Collect user IDs

    // Delete users with matching emails
    const deletedUsers = await User.deleteMany({ email: { $in: preUserEmails } });

    // Delete enrollments associated with the deleted users
    const deletedEnrollments = await Enrollment.deleteMany({ learner: { $in: userIds } });

    res.status(200).json({
      message: 'File, associated students, users, and enrollments deleted successfully.',
      deletedPreUsers: deletedPreUsers.deleteCount,
      deletedUsers: deletedUsers.deletedCount, 
      deletedEnrollments: deletedEnrollments.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Failed to delete file.' });
  }
});

// DELETE selected pre-users by email and associated enrollments
router.post('/files/:fileId/delete-preUsers', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { emails } = req.body; // Array of emails to delete

    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'No emails provided for deletion.' });
    }
logger.debug("test");
    // Find the pre-users to delete
    const preUsersToDelete = await PreUser.find({
      email: { $in: emails },
      file: fileId,
    });
     console.log(preUsersToDelete);
    if (!preUsersToDelete || preUsersToDelete.length === 0) {
      return res.status(404).json({ message: 'No matching pre-users found to delete.' });
    }

    // Collect user emails and IDs
    const userEmails = preUsersToDelete.map((preUser) => preUser.email);

    // Delete the pre-users
    const deletedPreUsers = await PreUser.deleteMany({
      email: { $in: emails },
      file: fileId,
    });

    // Remove the references from the file
    await File.findByIdAndUpdate(fileId, {
      $pull: { preUsers: { $in: preUsersToDelete.map((preUser) => preUser._id) } },
    });

    // Find users in the User collection matching the emails
    const usersToDelete = await User.find({ email: { $in: userEmails } });

    if (usersToDelete.length > 0) {
      const userIds = usersToDelete.map((user) => user._id);

      // Delete the users
      const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });

      // Delete enrollments associated with the users
      const deletedEnrollments = await Enrollment.deleteMany({
        learner: { $in: userIds },
      });

      return res.status(200).json({
        message: 'Selected pre-users deleted successfully.',
        deletedPreUsers: deletedPreUsers.deletedCount,
        deletedUsers: deletedUsers.deletedCount,
        deletedEnrollments: deletedEnrollments.deletedCount,
      });
    }

    // If no matching users were found in the User collection
    res.status(200).json({
      message: 'Selected pre-users deleted successfully.',
      deletedPreUsers: deletedPreUsers.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting pre-users and enrollments:', error);
    res.status(500).json({ message: 'Failed to delete pre-users and enrollments.' });
  }
});


router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedOn: -1 }); // Latest first
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Failed to fetch files.' });
  }
});


router.get('/files/:fileId/preUsers', async (req, res) => {
  try {
      const { fileId } = req.params;

      // Find the file and populate its users
      const file = await File.findById(fileId).populate('preUsers');
      if (!file) {
          return res.status(404).json({ message: 'File not found.' });
      }

      // Get all student emails
      const preUserEmails = file.preUsers.map((preUser) => preUser.email);

      // Find matching users in the User collection
      const matchingUsers = await User.find({ email: { $in: preUserEmails } });

      if (matchingUsers.length > 0) {
          const matchedEmails = matchingUsers.map((user) => user.email);

          // Update the status of matching users to "Accepted"
          await PreUser.updateMany(
              { email: { $in: matchedEmails } },
              { $set: { status: 'Accepted' } }
          );
      }

      // Re-fetch users to reflect updated statuses
      const updatedFile = await File.findById(fileId).populate('preUsers');

      res.status(200).json({ preUsers: updatedFile.preUsers });
  } catch (error) {
      console.error('Error fetching and updating students:', error);
      res.status(500).json({ message: 'Failed to fetch and update users.' });
  }
});



router.get('/:institutionCode', async (req, res) => {
  try {
    const institutionCode = req.params.institutionCode;

    const preUsers = await PreUser.find({ institutionCode }).sort({ email: 1 }); 
    res.status(200).json(preUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// UPDATE user status
router.post('/update-status', async (req, res) => {
  console.log("route accessed");
  try {

    const { email } = req.body;
    console.log("Received email for update:", email); // Confirm email is received

    const updatedPreUser = await PreUser.findOneAndUpdate(
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

    if (!updatedPreUser) {
      console.log("No user found with email:", email);
      return res.status(404).json({
        success: false,
        error: `No user found with email: ${email}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to 'accepted' for ${email}`,
      data: {
        preUser: updatedPreUser
      }
    });

  } catch (error) {
    console.log("Error in update-preUser route:", error); // Log error details
    return res.status(400).json({
      success: false,
      error: error.message,
      details: 'Error updating user status'
    });
  }
});

router.get('/verify-email/:email', async (req, res) => {
  try {
    const email = req.params.email; // Extract email from the route parameter
    console.debug('Email to verify:', email); // Debug log for email

    // Use Mongoose's `findOne` since you expect a single match for a unique email
    const preUser = await PreUser.findOne({ email }); 

    if (preUser) {
      return res.status(200).json({ success: true, preUser });
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