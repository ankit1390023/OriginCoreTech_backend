const express = require('express');
const router = express.Router();
const {
  createFeedPost,
  getFeedPosts,
  likeUnlikePost,
  commentOnPost,
  getUserFollows,
  toggleFollowUser
} = require('../controllers/feedController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/feed', createFeedPost);
router.get('/posts',authMiddleware, getFeedPosts);
router.post('/posts/:id/like', likeUnlikePost);
router.post('/posts/:id/comment', commentOnPost);
router.post('/follow', toggleFollowUser);
router.get('/:userId/:type', getUserFollows);

module.exports = router;
