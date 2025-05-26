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

router.post('/feed', createFeedPost);
router.get('/posts', getFeedPosts);
router.post('/posts/:id/like', likeUnlikePost);
router.post('/posts/:id/comment', commentOnPost);
router.post('/follow', toggleFollowUser);
router.get('/:userId/follower', getUserFollows);

module.exports = router;
