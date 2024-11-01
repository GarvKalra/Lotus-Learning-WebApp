const express = require('express');
const logger = require('../logger');
const Notification = require('../../backend/models/Notification')

const router = express.Router();
const {
  handleNotificationTrigger,
} = require('../notification-microservice/notification-microservice');

// Triggering Notification
router.post('/trigger-notification', (req, res) => {
  // TODO: Validate the request body

  // the request body should contain the data needed to trigger a notification
  handleNotificationTrigger(req.body)
    .then(() => {
      res.json({ message: 'Notification triggered successfully' });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: 'Error triggering notification', details: error });
    });
});


// POST route to save notification data
router.post('/save-notification', async (req, res) => {
  try {
    
    const notifications = Array.isArray(req.body) ? req.body : [req.body]; // Ensure we have an array
    logger.debug(notifications);
    // Create an array to hold all save promises
    const savePromises = notifications.map(notificationData => {
      // Create a new Notification instance with data from notificationData
      const newNotification = new Notification({
        userId: notificationData.userId,
        courseId: notificationData.courseId,
        type: notificationData.type,
        payload: notificationData.payload,
        senderName:notificationData.senderName,
        status: notificationData.status || 'unread',  // Default to 'unread'
        retryCount: 0,
        maxRetryAttempts: 3
      });
      return newNotification.save(); // Return the promise from save operation
    });

    // Wait for all notifications to be saved
    const savedNotifications = await Promise.all(savePromises);

    logger.debug(savedNotifications);

    // Send a success response
    res.status(201).json({
      message: 'Notifications saved successfully',
      savedNotifications
    });
  } catch (error) {
    // Handle any errors that occur during the save
    res.status(500).json({ error: 'Failed to save notifications', details: error });
  }
});


router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all notifications that match the given userId
    const notifications = await Notification.find({ userId });

    // Return the found notifications
    res.status(200).json(notifications);
  } catch (error) {
    // Handle any errors that occur during retrieval
    res.status(500).json({ error: 'Failed to fetch notifications', details: error });
  }
});


router.put('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true } 
    );

    if (!updatedNotification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', updatedNotification });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification status', details: error });
  }
});

router.delete('/delete-notification', async (req, res) => {
  try {
    const { notificationIds } = req.body; // Expect `notificationIds` to be a single ID or an array of IDs

    if (!notificationIds || (Array.isArray(notificationIds) && notificationIds.length === 0)) {
      return res.status(400).json({ error: 'No notificationId(s) provided for deletion' });
    }

    // If `notificationIds` is an array, perform a bulk delete; otherwise, delete a single notification
    const deleteResult = Array.isArray(notificationIds)
      ? await Notification.deleteMany({ _id: { $in: notificationIds } })
      : await Notification.findByIdAndDelete(notificationIds);

    // Check if any notifications were deleted
    if ((deleteResult.deletedCount === 0) || !deleteResult) {
      return res.status(404).json({ error: 'Notification(s) not found' });
    }

   
    res.status(200).json({
      message: 'Notification(s) deleted successfully',
      deleteResult
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification(s)', details: error });
  }
});

module.exports = router;



module.exports = router;
