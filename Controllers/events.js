const express = require('express');
const verifyToken = require('../middleware/verify-token.js');
const Event = require('../models/event.js');
const router = express.Router();

// ========== Public Routes ===========

// ========= Protected Routes =========

router.use(verifyToken);

router.post('/', async (req, res) => {
    try {
      req.body.author = req.user._id;
      const event = await Event.create(req.body);
      res.status(201).json(event);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
});

router.get('/', async (req, res) => {
    try {
      const event = await Event.find({})
        .populate('author')
        .sort({ createdAt: 'desc' });
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.get('/:eventId', async (req, res) => {
    try {
      const event = await Event.findById(req.params.eventId).populate([
        'betters',
      ]);
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.put('/:hootId', async (req, res) => {
    try {
      // Find the hoot:
      const hoot = await Hoot.findById(req.params.hootId);
  
      // Check permissions:
      if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      // Update hoot:
      const updatedHoot = await Hoot.findByIdAndUpdate(
        req.params.hootId,
        req.body,
        { new: true }
      );
  
      // Append req.user to the author property:
      updatedHoot._doc.author = req.user;
  
      // Issue JSON response:
      res.status(200).json(updatedHoot);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.delete('/:hootId', async (req, res) => {
    try {
      const hoot = await Hoot.findById(req.params.hootId);
  
      if (!hoot.author.equals(req.user._id)) {
        return res.status(403).send("You're not allowed to do that!");
      }
  
      const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
      res.status(200).json(deletedHoot);
    } catch (error) {
      res.status(500).json(error);
    }
});

router.post('/:hootId/comments', async (req, res) => {
    try {
      req.body.author = req.user._id;
      const hoot = await Hoot.findById(req.params.hootId);
      hoot.comments.push(req.body);
      await hoot.save();
  
      // Find the newly created comment:
      const newComment = hoot.comments[hoot.comments.length - 1];
  
      newComment._doc.author = req.user;
  
      // Respond with the newComment:
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json(error);
    }
});

module.exports = router;
