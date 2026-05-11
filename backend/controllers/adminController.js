const asyncHandler = require('express-async-handler');
const userRepository = require('../repositories/userRepository');
const propertyRepository = require('../repositories/propertyRepository');
const db = require('../db/connection');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const sql = 'SELECT ID, NAME, EMAIL, ROLE, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC';
  const result = await db.execute(sql);
  const formatted = result.rows.map(u => ({
    _id: u.ID,
    name: u.NAME,
    email: u.EMAIL,
    role: u.ROLE,
    createdAt: u.CREATED_AT
  }));
  res.json(formatted);
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);

  if (user) {
    const updatedUser = await userRepository.update(req.params.id, { role: req.body.role });
    res.json({
      _id: updatedUser.ID,
      name: updatedUser.NAME,
      email: updatedUser.EMAIL,
      role: updatedUser.ROLE,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);

  if (user) {
    if (user.ROLE === 'admin') {
      res.status(400);
      throw new Error('Cannot delete admin user');
    }
    const sql = 'DELETE FROM USERS WHERE ID = :id';
    await db.execute(sql, { id: req.params.id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all listings
// @route   GET /api/admin/listings
// @access  Private/Admin
const getListings = asyncHandler(async (req, res) => {
  const listings = await propertyRepository.findAll({});
  const formatted = listings.map(p => ({
    _id: p.ID,
    title: p.TITLE,
    user: { name: p.OWNER_NAME, email: p.OWNER_EMAIL },
    price: p.PRICE,
    createdAt: p.CREATED_AT
  }));
  res.json(formatted);
});

// @desc    Delete listing
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await propertyRepository.findById(req.params.id);

  if (listing) {
    const sql = 'DELETE FROM PROPERTIES WHERE ID = :id';
    await db.execute(sql, { id: req.params.id });
    res.json({ message: 'Listing removed' });
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const userCount = await db.execute('SELECT COUNT(*) as COUNT FROM USERS');
  const listingCount = await db.execute('SELECT COUNT(*) as COUNT FROM PROPERTIES');
  
  // Recent activity
  const recentUsers = await db.execute('SELECT ID, NAME, EMAIL, CREATED_AT FROM USERS ORDER BY CREATED_AT DESC FETCH FIRST 5 ROWS ONLY');
  const recentListings = await db.execute('SELECT ID, TITLE, CREATED_AT FROM PROPERTIES ORDER BY CREATED_AT DESC FETCH FIRST 5 ROWS ONLY');

  res.json({
    totalUsers: userCount.rows[0].COUNT,
    totalListings: listingCount.rows[0].COUNT,
    recentUsers: recentUsers.rows.map(u => ({ _id: u.ID, name: u.NAME, email: u.EMAIL, createdAt: u.CREATED_AT })),
    recentListings: recentListings.rows.map(l => ({ _id: l.ID, title: l.TITLE, createdAt: l.CREATED_AT })),
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getListings,
  deleteListing,
  getStats,
};
