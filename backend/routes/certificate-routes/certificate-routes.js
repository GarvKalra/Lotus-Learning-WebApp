const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Certificate Schema
const certificateSchema = new mongoose.Schema({
  username: { type: String, required: true },
  courseName: { type: String, required: true },
  certificateId: { type: String, required: true },
  dateIssued: { type: Date, default: Date.now },
});

const Certificate = mongoose.model('Certificate', certificateSchema);

router.get("/verify/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying certificate.", error });
  }
});

router.get("/verify/:certificateId", async (req, res) => {
    const { certificateId } = req.params;
  
    try {
      const certificate = await Certificate.findOne({ certificateId }).populate("username").populate("courseName");
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found or invalid." });
      }
  
      res.status(200).json({
        message: "Certificate is valid.",
        certificate: {
          user: certificate.username,  // Return the user details
          course: certificate.courseName,  // Return the course details
          issuedAt: certificate.issuedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error verifying certificate.", error });
    }
  });
  
  module.exports = router;


// POST route to save certificate
router.post('/save', async (req, res) => {
  const { username, courseName, certificateId } = req.body;

  try {
    // Save the new certificate directly
    const newCertificate = new Certificate({
      username,
      courseName,
      certificateId,
    });

    await newCertificate.save();

    res.status(200).json({
      success: true,
      certificate: newCertificate,
    });
  } catch (error) {
    console.error('Error saving certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving certificate.',
    });
  }
});


module.exports = router;
