    const { DataTypes } = require('sequelize');
    const sequelize = require('../config/database');

    const Chat = sequelize.define('chat', {
    chat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },


    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    responder: {
        type: DataTypes.STRING,
        allowNull: false
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    datetime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },

    actual_response: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    full_response: {
        type: DataTypes.TEXT
    },


    is_proccess: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

    }, {
    timestamps: false,
    tableName: 'chat'
    });

    module.exports = Chat;