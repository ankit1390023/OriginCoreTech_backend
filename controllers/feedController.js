const { User, UserDetail, CompanyRecruiterProfile, FeedPost } = require('../models');
const { Follow } = require('../models');
const { Op, fn, col, literal, Sequelize, where } = require('sequelize');

// create feed
const createFeedPost = async (req, res) => {
  try {
    const { userId, caption, image } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Fetch user with details
    const user = await User.findOne({
      where: { id: userId },
      include: [
        { model: UserDetail, as: 'UserDetail' },
        { model: CompanyRecruiterProfile, as: 'CompanyRecruiterProfile' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = user.userRole;
    let profilePic = null;

    if (userRole === 'COMPANY') {
      profilePic = user.CompanyRecruiterProfile ? user.CompanyRecruiterProfile.logoUrl : null;
    } else {
      profilePic = user.UserDetail ? user.UserDetail.userprofilepic : null;
    }

    const feedPost = await FeedPost.create({
      userId,
      image: image || null,
      caption,
      userRole,
      profilePic,
    });

    return res.status(201).json({ message: 'Feed post created successfully', feedPost });
  } catch (error) {
    console.error('Error creating feed post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// get all feed post
const getFeedPosts = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: rawPosts } = await FeedPost.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: UserDetail,
              as: 'UserDetail',
              attributes: ['userprofilepic']
            },
            {
              model: CompanyRecruiterProfile,
              as: 'CompanyRecruiterProfile',
              attributes: ['logoUrl']
            },
            {
              model: Follow,
              as: 'Followers',
              attributes: [[sequelize.fn('COUNT', sequelize.col('Followers.followerId')), 'followersCount']],
              required: false,
            }
          ]
        }
      ]
    });

    // Parse comments and restructure user profilePic
    const posts = rawPosts.map(post => {
      const postData = post.toJSON();

      // Parse comments
      postData.comments = postData.comments ? JSON.parse(postData.comments) : [];

      // Dynamically attach user profilePic
      if (postData.User.userRole === 'COMPANY') {
        postData.User.profilePic = postData.User.CompanyRecruiterProfile?.logoUrl || null;
      } else {
        postData.User.profilePic = postData.User.UserDetail?.userprofilepic || null;
      }

      // Optionally remove nested objects after extracting profilePic
      delete postData.User.UserDetail;
      delete postData.User.CompanyRecruiterProfile;

      return postData;
    });

    return res.status(200).json({
      totalPosts: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      posts,
    });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// update if unlike after like
const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, action } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ message: 'userId and action are required' });
    }

    const post = await FeedPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (action === 'like') {
      post.likeCount = (post.likeCount || 0) + 1;
    } else if (action === 'unlike') {
      post.likeCount = Math.max((post.likeCount || 0) - 1, 0);
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "like" or "unlike".' });
    }

    await post.save();

    return res.status(200).json({ message: 'Post like status updated', likeCount: post.likeCount });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// comment post count
const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, comment } = req.body;

    if (!userId || !comment) {
      return res.status(400).json({ message: 'userId and comment are required' });
    }

    const post = await FeedPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let comments = [];
    if (post.comments) {
      comments = JSON.parse(post.comments);
    }

    comments.push({
      userId,
      comment,
      createdAt: new Date(),
    });

    post.comments = JSON.stringify(comments);
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    return res.status(200).json({ message: 'Comment added', comments, commentCount: post.commentCount });
  } catch (error) {
    console.error('Error commenting on post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// api for follow / unfollow user
const toggleFollowUser = async (req, res) => {
  const { followerId, followedId } = req.body;

  if (followerId === followedId) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  try {
    const existingFollow = await Follow.findOne({
      where: { followerId, followedId },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      return res.status(200).json({ message: "Unfollowed successfully" });
    } else {
      // Follow
      await Follow.create({ followerId, followedId });
      return res.status(200).json({ message: "Followed successfully" });
    }
  } catch (err) {
    console.error("Error toggling follow:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get api followers/following
const getUserFollows = async (req, res) => {
  const { userId, type } = req.params;

  try {
    if (type !== 'followers' && type !== 'following') {
      return res.status(400).json({ message: "Invalid type. Use 'followers' or 'following'" });
    }

    const whereCondition = type === 'followers'
      ? { followedId: userId }
      : { followerId: userId };

    const includeAlias = type === 'followers' ? 'Follower' : 'Followed';

    const follows = await Follow.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: includeAlias,
          attributes: ['firstName', 'lastName', 'userRole']
        }
      ]
    });

    const result = follows.map(f => f[includeAlias]);

    res.status(200).json({ count: result.length, [type]: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  createFeedPost,
  getFeedPosts,
  likeUnlikePost,
  commentOnPost,
  toggleFollowUser,
  getUserFollows

};
