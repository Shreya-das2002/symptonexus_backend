const kafka = require("../../config/kafka");
const AppointmentService = require("../../services/appointment.service");

const consumer = kafka.consumer({
  groupId: "appointment-booking-group"
});

const runAppointmentConsumer = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "appointment-booking-request",
    fromBeginning: false
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const payload = JSON.parse(message.value.toString());

        const result = await AppointmentService.createAppointment(
          {
            patient_id: payload.patient_id,
            doctor_id: payload.doctor_id,
            doctor_availability_id: payload.doctor_availability_id,
            booking_date: payload.booking_date,
            description: payload.description
          },
          payload.created_by || null
        );

        console.log("Kafka Appointment Booking Result:", {
          request_id: payload.request_id,
          result
        });

      } catch (error) {
        console.error("Kafka Appointment Consumer Error:", error);
      }
    }
  });
};

module.exports = {
  consumer,
  runAppointmentConsumer
};