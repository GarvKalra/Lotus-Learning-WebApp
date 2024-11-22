const express = require("express");
const router = express.Router();


// SAVE NEW USER TO THE COOKIES
router.post(
  '/save-user',
  (req, res) => {
    console.log(req.body);
    try {
      const userData = JSON.stringify(req.body);
      res.cookie('userDataAuth', userData, {
        httpOnly: true,
        sameSite: 'None',
        secure: true, // Enable for production; set to false for development
      });
      res.status(200).json({ res: 'Success', data: req.body });
    } catch (err) {
      console.error('Server-side error:', err);
      res.status(500).json({ err: 'Internal server error' }); // More specific message
    }
  }
);

// GET USER FROM COOKIES
router.get('/get-user-cookies', (req, res) => {
  const userDataCookie = req.cookies.userDataAuth;
  if (userDataCookie) {
    try {
      const userData = JSON.parse(userDataCookie);
      res.json({ userData });
    } catch (error) {
      console.error('error geting the data', error);
      res.status(500).json({ error: 'server side error' });
    }
  } else {
    res.json(null);
  }
});
  
// DELETE USER FROM COOKIES
router.post(
  '/delete-user-cookie',
  (req, res) => {
    try {
      res.set('Cache-Control', 'no-store'); 
      res.clearCookie('userDataAuth', {
        httpOnly: true,
        sameSite: 'None',
        secure: true, 
      });
      console.log('Set-Cookie header sent:', res.getHeaders()['set-cookie']);
      console.log('Cookies after clearing:', req.cookies);
     
      res.status(200).json({ res: 'Success', message: 'User cookie deleted successfully' });
    } catch (err) {
      console.log('Server-side error', err);
      res.status(500).json({ err: 'Server-side error' });
    }
  }
);


module.exports = router;