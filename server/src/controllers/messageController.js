const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { uploadImageBuffer } = require('../utils/cloudinary');

const sendMessage = async (req, res) => {
  const { content, chatId, type = 'text' } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: 'content and chatId are required' });
  }

  try {
    const chat = await Chat.findById(chatId).populate('users');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const isParticipant = chat.users.some((user) => user._id.equals(req.user._id));
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this chat' });
    }

    const message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
      type,
    });

    let populated = await message.populate('sender', 'name email profilePic');
    populated = await populated.populate({
      path: 'chat',
      populate: { path: 'users', select: 'name email profilePic' },
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    res.status(201).json(populated);
  } catch (error) {
    console.error('sendMessage error', error.message);
    res.status(500).json({ message: 'Unable to send message' });
  }
};

const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId).populate('users');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    const isParticipant = chat.users.some((user) => user._id.equals(req.user._id));
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not part of this chat' });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email profilePic')
      .populate('chat')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('getMessages error', error.message);
    res.status(500).json({ message: 'Unable to load messages' });
  }
};

const uploadMessageImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    const result = await uploadImageBuffer(req.file.buffer, 'harate_messages');
    res.status(201).json({ url: result.secure_url });
  } catch (error) {
    console.error('uploadMessageImage error', error.message);
    res.status(500).json({ message: 'Unable to upload image' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  uploadMessageImage,
};

