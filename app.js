require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

const responseMiddleware = require("./middlewares/response.middleware");
// Kafka is temporarily disabled in production. Keep these imports for when
// Kafka-based appointment processing is enabled again.
// const { connectAppointmentProducer } = require("./kafka/producer/appointment.producer");
// const { runAppointmentConsumer } = require("./kafka/Consumer/appointment.consumer");
const { sequelize } = require("./models");

require("./models/User");
require("./models/Admin_user");
require("./models/Doctor");
require("./models/Chat");
require("./models/Patient_Feedback");
require("./models/Doctor_Feedback.js");

app.use(cors({
  origin: "https://final-year-project-ud46.onrender.com",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseMiddleware);

const registerRoutes = require("./routes/index.routes");
registerRoutes(app);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB Connected");

    await sequelize.sync();
    console.log("Database synced");

    // Kafka is temporarily disabled in production. Appointment booking is
    // handled directly by the backend service.
    // try {
    //   await connectAppointmentProducer();
    //   await runAppointmentConsumer();
    //   console.log("Kafka connected successfully");
    // } catch (kafkaError) {
    //   console.error("Kafka startup failed:", kafkaError.message);
    //   console.log("Server will continue without Kafka");
    // }

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.keepAliveTimeout = 0;
    server.headersTimeout = 0;

  } catch (error) {
    console.error("Server Start Error:", error);
    process.exit(1);
  }
};

startServer();
