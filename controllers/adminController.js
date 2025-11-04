const Notice = require("../models/Notice");

// Create a new notice
exports.createNotice = async (req, res) => {
  try {
    const { title, message } = req.body;
    const notice = new Notice({
      title,
      message,
      createdBy: req.user.id
    });
    await notice.save();
    res.json({ message: "Notice created successfully", notice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all notices
exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().populate("createdBy", "name email");
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
