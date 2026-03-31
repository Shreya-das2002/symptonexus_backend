const sequelize = require("../config/database");

const Appointment = require("../models/Appointment");
const DomainLookup = require("../models/Domain_lookup");
const DoctorAvailability = require("../models/Doctor_Availablity");

class AppointmentService {

  /* CREATE APPOINTMENT BY PATIENT */
  static async createAppointment(payload, createdBy = null) {

    const t = await sequelize.transaction();

    try {

      const {
        patient_id,
        doctor_id,
        doctor_availability_id,
        booking_date
      } = payload;

      /* VALIDATION */
      if (!patient_id || !doctor_id || !doctor_availability_id || !booking_date) {

        await t.rollback();

        return {
          success: false,
          message: "patient_id, doctor_id, doctor_availability_id and booking_date are required"
        };

      }

      /* CHECK SLOT EXISTS */
      const slot = await DoctorAvailability.findOne({

        where: {
          doctor_availability_id,
          doctor_id,
          date: booking_date
        },

        transaction: t

      });

      if (!slot) {

        await t.rollback();

        return {
          success: false,
          message: "Selected doctor availability not found"
        };

      }

      /* BOOKING STATUS CHECK */
      const bookingStatusLookup = await DomainLookup.findOne({

        where: {
          domain_type: "booking_status",
          domain_name: "Booking Initiated"
        },

        transaction: t

      });

      if (!bookingStatusLookup) {

        await t.rollback();

        return {
          success: false,
          message: "Booking Initiated status not found"
        };

      }

      /* DUPLICATE CHECK */
      const existingAppointment = await Appointment.findOne({

        where: {
          patient_id,
          doctor_id,
          doctor_availability_id,
          booking_date
        },

        transaction: t

      });

      if (existingAppointment) {

        await t.rollback();

        return {
          success: false,
          message: "Appointment already booked for this date"
        };

      }

      /* CREATE APPOINTMENT */
      const appointment = await Appointment.create({

        patient_id,
        doctor_id,
        doctor_availability_id,
        booking_date,
        booking_time: null,
        description: null,
        document_id: null,
        booking_status: Number(bookingStatusLookup.domain_value),
        created_on: new Date(),
        created_by: patient_id,
        updated_on: null,
        updated_by: null

      }, { transaction: t });

      await t.commit();

      return {

        success: true,
        message: "Appointment booked successfully",
        data: {
          appointment_id: appointment.appointment_id,
          patient_id: appointment.patient_id,
          doctor_id: appointment.doctor_id,
          doctor_availability_id: appointment.doctor_availability_id,
          booking_date: appointment.booking_date,
          booking_time: appointment.booking_time,
          description: appointment.description,
          document_id: appointment.document_id,
          booking_status: appointment.booking_status,
          created_on: appointment.created_on,
          created_by: appointment.created_by,
          updated_on: appointment.updated_on,
          updated_by: appointment.updated_by
        }

      };

    }

    catch (error) {

      await t.rollback();

      console.error("CREATE APPOINTMENT ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }

  // All aapointments destails

  static async getAllAppointments() {

  try {

    const appointments = await Appointment.findAll({
      include: [
        {
          model: DoctorAvailability,
          as: "availability",
          required: false
        }
      ],
    });

    const formatted = appointments.map((item) => ({
      appointment_id: item.appointment_id,
      patient_id: item.patient_id,
      doctor_id: item.doctor_id,
      booking_date: item.booking_date,
      appointment_time: item.booking_time,
      booking_status: item.booking_status,
      booking_time: item.created_on.toISOString().split("T")[1].split(".")[0],
      

      doc_slot: item.availability
        ? `${item.availability.start_time} - ${item.availability.end_time}`
        : null,

      fees: item.availability?.fees || null,

      created_on: item.created_on.toISOString().split("T")[0],
      created_by: item.created_by

    }));

    return {
      success: true,
      message: "Appointments fetched successfully",
      data: formatted
    };

  } catch (error) {

    return {
      success: false,
      message: error.message,
      data: []
    };

  }

}

}

module.exports = AppointmentService;