const axios = require("axios");
const Chat = require("../models/Chat");

const PYTHON_CHATBOT_URL = "https://symptonexus-agentic.onrender.com/api/chat/symptom-check";

class ChatService {
  async processChat({ user_id, responder, message, conversation = [] }) {
    try {
      const pythonResponse = await axios.post(
        PYTHON_CHATBOT_URL,
        {
          message,
          conversation: []
        },
        {
          timeout: 300000
        }
      );

      const botResult = pythonResponse.data;

      const savedChat = await Chat.create({
        user_id,
        responder,
        message,
        actual_response:
          botResult.reply ||
          botResult.message ||
          botResult.response ||
          JSON.stringify(botResult),
        full_response: JSON.stringify(botResult),
        is_proccess: true
      });

      return {
        savedChat,
        bot_response: botResult,
        doctors: botResult.doctors || [],
        suggested_specialization: botResult.suggested_specialization || null
      };

    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Chatbot timeout";

      const savedChat = await Chat.create({
        user_id,
        responder,
        message,
        actual_response: errorMessage,
        full_response: JSON.stringify({
          error: true,
          message: errorMessage
        }),
        is_proccess: false
      });

      return {
        savedChat,
        bot_response: {
          reply: "The chatbot is taking too long to respond. Please try again with a shorter message.",
          error: true
        },
        doctors: [],
        suggested_specialization: null
      };
    }
  }

  async startChatPolling({ user_id, responder, message }) {
    const savedChat = await Chat.create({
      user_id,
      responder,
      message,
      actual_response: null,
      full_response: null,
      is_proccess: false
    });

    this.processChatInBackground({
      chat_id: savedChat.chat_id,
      message
    });

    return savedChat;
  }

  async processChatInBackground({ chat_id, message }) {
    try {
      const pythonResponse = await axios.post(
        PYTHON_CHATBOT_URL,
        {
          message,
          conversation: []
        },
        {
          timeout: 300000
        }
      );

      const botResult = pythonResponse.data;

      await Chat.update(
        {
          actual_response:
            botResult.reply ||
            botResult.message ||
            botResult.response ||
            JSON.stringify(botResult),
          full_response: JSON.stringify(botResult),
          is_proccess: true
        },
        {
          where: { chat_id }
        }
      );

    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Chatbot timeout";

      await Chat.update(
        {
          actual_response: errorMessage,
          full_response: JSON.stringify({
            error: true,
            message: errorMessage
          }),
          is_proccess: false
        },
        {
          where: { chat_id }
        }
      );
    }
  }

  async getChatStatus(chat_id) {
    const chat = await Chat.findByPk(chat_id);

    if (!chat) {
      return null;
    }

    let botResponse = null;

    try {
      botResponse = chat.full_response ? JSON.parse(chat.full_response) : null;
    } catch {
      botResponse = null;
    }

    return {
      chat,
      bot_response: botResponse,
      doctors: botResponse?.doctors || [],
      suggested_specialization: botResponse?.suggested_specialization || null
    };
  }
}

module.exports = new ChatService();