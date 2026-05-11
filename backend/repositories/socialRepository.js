const User = require('../models/User');
const Property = require('../models/Property');
const Comment = require('../models/Comment');

class SocialRepository {
  async follow(followerId, followingId) {
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower || !following) return false;

    if (follower.following.includes(followingId)) return false;

    follower.following.push(followingId);
    following.followers.push(followerId);

    await follower.save();
    await following.save();
    return true;
  }

  async unfollow(followerId, followingId) {
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower || !following) return false;

    follower.following = follower.following.filter(id => id.toString() !== followingId.toString());
    following.followers = following.followers.filter(id => id.toString() !== followerId.toString());

    await follower.save();
    await following.save();
    return true;
  }

  async getStats(userId, viewerId = null) {
    const user = await User.findById(userId);
    if (!user) return { followersCount: 0, followingCount: 0, isFollowing: false };

    let isFollowing = false;
    if (viewerId) {
      isFollowing = user.followers.some(id => id.toString() === viewerId.toString());
    }

    return {
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
    };
  }

  async toggleLike(userId, propertyId) {
    const property = await Property.findById(propertyId);
    if (!property) return [];

    const index = property.likes.indexOf(userId);
    if (index > -1) {
      property.likes.splice(index, 1);
    } else {
      property.likes.push(userId);
    }

    await property.save();
    return property.likes.map(id => id.toString());
  }

  async addRating(raterId, userId, rating, comment) {
    // In our new model, ratings/comments are in the Comment model
    await Comment.findOneAndUpdate(
      { author: raterId, user: userId },
      { rating, text: comment },
      { upsert: true, new: true }
    );
  }

  async getFollowers(userId) {
    const user = await User.findById(userId);
    return user ? user.followers.map(id => id.toString()) : [];
  }
}

module.exports = new SocialRepository();
