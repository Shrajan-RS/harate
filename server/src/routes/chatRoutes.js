const express = require('express');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  searchUsers,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.post('/group', protect, createGroupChat);
router.put('/group/rename', protect, renameGroup);
router.get('/users/search', protect, searchUsers);

module.exports = router;

