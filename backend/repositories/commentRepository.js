const Comment = require('../models/Comment');

class CommentRepository {
  async create(commentData) {
    const comment = await Comment.create({
      property: commentData.property,
      author: commentData.user,
      rating: commentData.rating || 0,
      text: commentData.text || '',
    });
    return this.findById(comment._id);
  }

  async findById(id) {
    const comment = await Comment.findById(id).populate('author', 'name avatar');
    return comment ? this._mapComment(comment) : null;
  }

  async findByProperty(propertyId) {
    const comments = await Comment.find({ property: propertyId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    return comments.map(c => this._mapComment(c));
  }

  _mapComment(comment) {
    const cObj = comment.toObject();
    return {
      ID: cObj._id.toString(),
      PROPERTY_ID: cObj.property?._id?.toString() || cObj.property?.toString(),
      RATER_ID: cObj.author?._id?.toString() || cObj.author?.toString(),
      RATING: cObj.rating,
      USER_COMMENT: cObj.text,
      NAME: cObj.author?.name,
      AVATAR: cObj.author?.avatar,
      CREATED_AT: cObj.createdAt,
    };
  }
}

module.exports = new CommentRepository();
