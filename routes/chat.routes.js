const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat.controller");

// Existing API (direct response)
router.post("/send", (req, res) => {
  chatController.sendChatMessage(req, res);
});

// Polling: start chat (returns chat_id immediately)
router.post("/send-polling", (req, res) => {
  chatController.sendChatMessagePolling(req, res);
});

// Polling: check chat status
router.get("/status/:chat_id", (req, res) => {
  chatController.getChatStatus(req, res);
});

module.exports = router;