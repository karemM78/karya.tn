const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class UserService {
  async authUser(email, password) {
    const user = await userRepository.findByEmail(email);
    
    if (user && user.PASSWORD && (await bcrypt.compare(password, user.PASSWORD))) {
      return user;
    }
    return null;
  }

  async registerUser(userData) {
    const userExists = await userRepository.findByEmail(userData.email);
    if (userExists) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return await userRepository.create({
      ...userData,
      password: hashedPassword
    });
  }

  async getUserProfile(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUserProfile(id, updateData) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    return await userRepository.update(id, updateData);
  }
}

module.exports = new UserService();
