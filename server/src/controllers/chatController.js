const Chat = require('../models/Chat');
const User = require('../models/User');

const populateChat = (query) =>
  query
    .populate('users', '-googleId -createdAt -updatedAt')
    .populate('groupAdmin', '-googleId -createdAt -updatedAt')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name email profilePic',
      },
    });

const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    let chat = await Chat.findOne({
      isGroup: false,
      users: { $all: [req.user._id, userId] },
    });

    if (!chat) {
      chat = await Chat.create({
        chatName: 'Direct chat',
        isGroup: false,
        users: [req.user._id, userId],
      });
    }

    chat = await populateChat(Chat.findById(chat._id));
    res.json(chat);
  } catch (error) {
    console.error('accessChat error', error.message);
    res.status(500).json({ message: 'Unable to access chat' });
  }
};

const fetchChats = async (req, res) => {
  try {
    const chats = await populateChat(
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).sort({
        updatedAt: -1,
      }),
    );
    res.json(chats);
  } catch (error) {
    console.error('fetchChats error', error.message);
    res.status(500).json({ message: 'Unable to fetch chats' });
  }
};

const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || users.length < 2) {
    return res
      .status(400)
      .json({ message: 'Group chat requires at least 3 participants' });
  }

  try {
    const group = await Chat.create({
      chatName: name,
      isGroup: true,
      users: [...users, req.user._id],
      groupAdmin: req.user._id,
    });

    const populated = await populateChat(Chat.findById(group._id));
    res.status(201).json(populated);
  } catch (error) {
    console.error('createGroupChat error', error.message);
    res.status(500).json({ message: 'Unable to create group chat' });
  }
};

const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  if (!chatId || !chatName) {
    return res.status(400).json({ message: 'chatId and chatName required' });
  }
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: 'Group chat not found' });
    }
    if (!chat.groupAdmin.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'Only group admins can rename the chat' });
    }
    chat.chatName = chatName;
    await chat.save();
    const populated = await populateChat(Chat.findById(chat._id));
    res.json(populated);
  } catch (error) {
    console.error('renameGroup error', error.message);
    res.status(500).json({ message: 'Unable to rename group chat' });
  }
};

const searchUsers = async (req, res) => {
  const { term } = req.query;
  const search = term
    ? {
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { email: { $regex: term, $options: 'i' } },
        ],
      }
    : {};

  try {
    const users = await User.find(search)
      .find({ _id: { $ne: req.user._id } })
      .select('name email profilePic status lastSeen');
    res.json(users);
  } catch (error) {
    console.error('searchUsers error', error.message);
    res.status(500).json({ message: 'Unable to search users' });
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  searchUsers,
};

