// routes/feedbackRoutes.js
import express from 'express';
import { Feedback } from '../models/feedbackModel.js';

const router = express.Router();

// Add feedback
router.post('/add', async (req, res) => {
  const { userId, message } = req.body;

  const feedback = new Feedback({
    userId,
    message,
  });

  try {
    await feedback.save();
    res.status(201).json({ message: 'Feedback added successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error adding feedback', error });
  }
});

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const feedbackList = await Feedback.find().populate('userId', 'username email'); // Populate user details if needed
    res.status(200).json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving feedback', error });
  }
});


// Delete feedback by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await Feedback.findByIdAndDelete(id);
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting feedback', error });
    }
  });
  

export default router;
