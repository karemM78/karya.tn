const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getListings,
  deleteListing,
  getStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.route('/users/:id')
  .put(updateUserRole)
  .delete(deleteUser);

router.get('/listings', getListings);
router.route('/listings/:id')
  .delete(deleteListing);

router.get('/stats', getStats);

module.exports = router;
