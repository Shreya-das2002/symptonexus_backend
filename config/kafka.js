const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "symptonexus-backend",
    brokers: ["localhost:9092"]
});

module.exports = kafka;