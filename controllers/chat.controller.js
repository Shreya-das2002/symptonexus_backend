const chatService = require("../services/chat.service");

class ChatController {
  async sendChatMessage(req, res) {
    try {
      const { user_id, responder, message, conversation = [] } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      const result = await chatService.processChat({
        user_id,
        responder,
        message,
        conversation
      });

      return res.status(200).json({
        success: true,
        data: result.savedChat,
        bot_response: result.bot_response,
        doctors: result.doctors || result.bot_response?.doctors || [],
        suggested_specialization:
          result.suggested_specialization ||
          result.bot_response?.suggested_specialization ||
          null
      });

    } catch (error) {
      console.error("ChatController Error:", error.message);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async sendChatMessagePolling(req, res) {
    try {
      const { user_id, responder, message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      const chat = await chatService.startChatPolling({
        user_id,
        responder,
        message
      });

      return res.status(200).json({
        success: true,
        message: "Chat processing started",
        chat_id: chat.chat_id,
        data: chat
      });

    } catch (error) {
      console.error("ChatController Polling Error:", error.message);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

async getChatStatus(req, res) {
  try {
    const { chat_id } = req.params;

    const result = await chatService.getChatStatus(chat_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Chat not found"
      });
    }

    const isFailed = result.bot_response?.error === true;

    return res.status(200).json({
      success: true,
      is_proccess: result.chat.is_proccess,
      is_failed: isFailed,
      data: result.chat,
      bot_response: result.bot_response,
      doctors: result.doctors || [],
      suggested_specialization: result.suggested_specialization || null
    });

  } catch (error) {
    console.error("Chat Status Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
}

module.exports = new ChatController();