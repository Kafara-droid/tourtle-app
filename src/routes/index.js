const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/index.js');

const firebaseAuthController = require('../controllers/firebase-auth-controller');
const DestinasiController = require('../controllers/destination-controller');
const PostsController = require('../controllers/posts-controller.js');


// Auth routes
router.post('/api/register', firebaseAuthController.registerUser);
router.post('/api/login', firebaseAuthController.loginUser);
router.post('/api/logout', firebaseAuthController.logoutUser);
router.post('/api/reset-password', firebaseAuthController.resetPassword);
router.post('/api/complete-profile', firebaseAuthController.completeUserProfile);
router.get('/api/profile', verifyToken, firebaseAuthController.getUserProfile);


// Destination
router.post('/api/destinasi', verifyToken, DestinasiController.createDestinasi);
router.get('/api/destinasi/:id', verifyToken, DestinasiController.getDestinasi);
router.get('/api/destinasi', verifyToken, DestinasiController.getAllDestinasi);
router.put('/api/destinasi/:id', verifyToken, DestinasiController.updateDestinasi);
router.delete('/api/destinasi/:id', verifyToken, DestinasiController.deleteDestinasi);

// router.post('/api/tour-guides', tourGuideController.createTourGuide);
// router.get('/api/tour-guides/:id', tourGuideController.getTourGuideById);
// router.get('/api/tour-guides', tourGuideController.getAllTourGuides);
// router.put('/api/tour-guides/:id', tourGuideController.updateTourGuide);
// router.delete('/api/tour-guides/:id', tourGuideController.deleteTourGuide);


//posts routes
router.get('/api/posts', verifyToken, PostsController.getPosts);

module.exports = router;