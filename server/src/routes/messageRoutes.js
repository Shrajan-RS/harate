const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  uploadMessageImage,
} = require('../controllers/messageController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are allowed.'));
    }
  },
});

router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);
router.post('/upload/image', protect, upload.single('image'), uploadMessageImage);

module.exports = router;

