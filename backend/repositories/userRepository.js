const User = require('../models/User');

class UserRepository {
  async findById(id) {
    const user = await User.findById(id);
    return user ? this._mapUser(user) : null;
  }

  async findByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user ? this._mapUser(user) : null;
  }

  async findByGoogleId(googleId) {
    const user = await User.findOne({ googleId });
    return user ? this._mapUser(user) : null;
  }

  async create(userData) {
    const user = await User.create({
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      googleId: userData.googleId,
      role: userData.role || 'client',
      avatar: userData.avatar || '',
      isAdmin: userData.isAdmin || false,
    });
    return this._mapUser(user);
  }

  async update(id, updateData) {
    const user = await User.findById(id);
    if (!user) return null;

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.email !== undefined) user.email = updateData.email.toLowerCase().trim();
    if (updateData.password !== undefined) user.password = updateData.password;
    if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
    if (updateData.bio !== undefined) user.bio = updateData.bio;
    if (updateData.location !== undefined) user.location = updateData.location;
    if (updateData.isAdmin !== undefined) user.isAdmin = updateData.isAdmin;
    if (updateData.role !== undefined) user.role = updateData.role;

    await user.save();
    return this._mapUser(user);
  }

  async updatePasswordResetToken(id, token, expires) {
    await User.findByIdAndUpdate(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    return user ? this._mapUser(user) : null;
  }

  // Mapper to maintain compatibility with legacy Oracle-based code (Uppercase keys)
  _mapUser(user) {
    const userObj = user.toObject();
    return {
      ID: userObj._id.toString(),
      NAME: userObj.name,
      EMAIL: userObj.email,
      PASSWORD: userObj.password,
      GOOGLE_ID: userObj.googleId,
      AVATAR: userObj.avatar,
      BIO: userObj.bio,
      LOCATION: userObj.location,
      IS_ADMIN: userObj.isAdmin ? 1 : 0,
      ROLE: userObj.role,
      RATING: userObj.rating,
      NUM_REVIEWS: userObj.numReviews,
      RESET_PASSWORD_TOKEN: userObj.resetPasswordToken,
      RESET_PASSWORD_EXPIRES: userObj.resetPasswordExpires,
      CREATED_AT: userObj.createdAt,
      UPDATED_AT: userObj.updatedAt,
    };
  }

  // Placeholder for JOIN query (Orders aren't migrated yet, but keeping the signature)
  async getUserOrders(userId) {
    // In MongoDB, we would use populate or aggregation
    return []; 
  }
}

module.exports = new UserRepository();
