const express = require("express");
const {
  loginWithGoogle,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/google", loginWithGoogle);
router.get("/me", protect, getProfile);

module.exports = router;
