const kafka = require("../../config/kafka");

const producer = kafka.producer();

const connectAppointmentProducer = async () => {
  await producer.connect();
  console.log("Appointment Kafka Producer Connected");
};

const sendAppointmentBookingEvent = async (key, payload) => {
  await producer.send({
    topic: "appointment-booking-request",
    messages: [
      {
        key,
        value: JSON.stringify(payload)
      }
    ]
  });
};

module.exports = {
  producer,
  connectAppointmentProducer,
  sendAppointmentBookingEvent
};