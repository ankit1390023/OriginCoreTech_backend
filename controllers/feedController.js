const { User, UserDetail, CompanyRecruiterProfile, FeedPost } = require('../models');
const { Follow } = require('../models');
const { Op, fn, col, literal, Sequelize, where } = require('sequelize');
const { PostLikes } = require('../models');
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

    // Get userId from JWT (set by authMiddleware)
    const loggedInUserId = req.user && req.user.id;
    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: user not found in token" });
    }

    const { count, rows: rawPosts } = await FeedPost.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'userRole'],
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
            }
          ]
        }
      ]
    });

    const posts = await Promise.all(rawPosts.map(async post => {
      const postData = post.toJSON();

      // Attach user profilePic
      if (postData.User.userRole === 'COMPANY') {
        postData.User.profilePic = postData.User.CompanyRecruiterProfile?.logoUrl || null;
      } else {
        postData.User.profilePic = postData.User.UserDetail?.userprofilepic || null;
      }

      // Remove nested models
      delete postData.User.UserDetail;
      delete postData.User.CompanyRecruiterProfile;

      // Parse comments
      postData.comments = postData.comments ? JSON.parse(postData.comments) : [];

      // Get followers count
      const followersCount = await Follow.count({
        where: { followedId: postData.User.id }
      });
      postData.User.followersCount = followersCount;

      // ✅ Check if logged-in user has liked this post
      const liked = await PostLikes.findOne({
        where: { postId: postData.id, userId: loggedInUserId }
      });
      postData.isLiked = !!liked;

      return postData;
    }));

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

    const existingLike = await PostLikes.findOne({ where: { postId, userId } });

    if (action === 'like') {
      if (!existingLike) {
        await PostLikes.create({ postId, userId });
        post.likeCount = (post.likeCount || 0) + 1;
      }
    } else if (action === 'unlike') {
      if (existingLike) {
        await existingLike.destroy();
        post.likeCount = Math.max((post.likeCount || 0) - 1, 0);
      }
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
