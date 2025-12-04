const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGoogleToken, ALLOWED_DOMAIN } = require('../services/googleAuth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const loginWithGoogle = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Missing Google credential' });
  }

  try {
    const profile = await verifyGoogleToken(credential);

    if (!profile.emailVerified) {
      return res
        .status(403)
        .json({ message: 'Google email must be verified before login.' });
    }

    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        profilePic: profile.picture,
        googleId: profile.googleId,
      });
    } else {
      user.name = profile.name;
      user.profilePic = profile.picture;
      user.googleId = profile.googleId;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        status: user.status,
        lastSeen: user.lastSeen,
        domain: ALLOWED_DOMAIN,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      message:
        statusCode === 403
          ? error.message
          : 'Unable to verify Google token. Please try again.',
    });
  }
};

const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { loginWithGoogle, getProfile };

