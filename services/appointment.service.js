const sequelize = require("../config/database");
const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/Doctor_Availablity");
const Admin = require("../models/Admin_user");
const Doctor = require("../models/Doctor");
const DoctorSpecialization = require("../models/Doctor_specalization");
const DoctorDetails = require("../models/Doctor_Details");
const DomainLookup = require("../models/Domain_lookup");
const patientDetails = require("../models/Patient_Details");
const Patient = require("../models/patient");

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

            /* GENERATE BOOKING NUMBER */

      const date = new Date(appointment.booking_date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const booking_no = `BK-${day}${month}${year}-${String(appointment.appointment_id).padStart(4, "0")}`;

        await appointment.update({
          booking_no
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
          booking_no: appointment.booking_no,
          booking_date: appointment.booking_no,
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
          model: Doctor,
          as: "doctor",
          attributes: [
            "doctor_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: true,

          include: [
            {
              model: DoctorDetails,
              as: "doctor_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            },
            {
              model: DoctorSpecialization,
              as: "doctor_specializations",
              attributes: ["specialization_id"],
              required: true,
              include: [
                {
                  model: DomainLookup,
                  as: "specializationLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "specialization" },
                  required: false
                }
              ]
            }
          ]
        },
         {
          model: DomainLookup,
          as: "statusLookup",
          attributes: ["domain_name"],
          where: { domain_type: "booking_status" },
          required: false
        },
        {
          model: DoctorAvailability,
          as: "availability",
          required: false
        }
      ],
    });

    const formatted = appointments.map((item) => ({
      appointment_id: item.appointment_id,
      appointment_no: item.appointment_no,
      patient_id: item.patient_id,
      doctor_id: item.doctor_id,
      doctor_name: [
        item.doctor?.first_name,
        item.doctor?.middle_name,
        item.doctor?.last_name
      ].filter(Boolean).join(" "),
      specialization: item.doctor?.doctor_specializations?.[0]?.specializationLookup?.domain_name || null,
      booking_date: item.booking_date,
      appointment_time: item.booking_time,
      booking_status: item.statusLookup?.domain_name || null,
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

/* =====================================================
   GET PENDING APPOINTMENTS (STANDARD ADMIN ONLY)
===================================================== */
static async getPendingAppointmentsByAdmin(adminId) {
  try {
    const admin = await Admin.findByPk(adminId);

    if (!admin || !admin.department_id) {
      return {
        success: false,
        message: "Admin not found or department not configured",
        data: []
      };
    }

    const specializationFilter = admin.department_id
      .split(",")
      .map(id => Number(id.trim()));

    const bookingStatusLookup = await DomainLookup.findOne({
      where: {
        domain_type: "booking_status",
        domain_name: "Booking Initiated"
      }
    });

    if (!bookingStatusLookup) {
      return {
        success: false,
        message: "Booking Initiated status not found",
        data: []
      };
    }

    const appointments = await Appointment.findAll({
      where: {
        booking_status: Number(bookingStatusLookup.domain_value)
      },

      attributes: [
        "appointment_id",
        "patient_id",
        "doctor_id",
        "doctor_availability_id",
        "booking_date",
        "booking_time",
        "description",
        "document_id",
        "booking_status",
        "created_on",
        "created_by"
      ],

      include: [
           {
          model: Patient,
          as: "patient",
          attributes: [
            "patient_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: false,
          include: [
            {
              model: patientDetails,
              as: "patient_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            },
          ]
        },
        
        {
          model: Doctor,
          as: "doctor",
          attributes: [
            "doctor_id",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: true,
          include: [
            {
              model: DoctorDetails,
              as: "doctor_detail",
              required: false,
              include: [
                {
                  model: DomainLookup,
                  as: "genderLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "gender" },
                  required: false
                }
              ]
            },
            {
              model: DoctorSpecialization,
              as: "doctor_specializations",
              attributes: ["specialization_id"],
              required: true,
              include: [
                {
                  model: DomainLookup,
                  as: "specializationLookup",
                  attributes: ["domain_name"],
                  where: { domain_type: "specialization" },
                  required: false
                }
              ]
            }
          ]
        },
        {
          model: DoctorAvailability,
          as: "availability",
          required: false
        }
      ],

      order: [["appointment_id", "DESC"]]
    });

    const filteredAppointments = appointments.filter(app =>
      app.doctor?.doctor_specializations?.some(spec =>
        specializationFilter.includes(Number(spec.specialization_id))
      )
    );

    const result = filteredAppointments.map(app => ({
      appointment_id: app.appointment_id,
      patient_id: app.patient_id,
      doctor_id: app.doctor_id,
      doctor_availability_id: app.doctor_availability_id,

      doctor_name: [
        app.doctor?.first_name,
        app.doctor?.middle_name,
        app.doctor?.last_name
      ].filter(Boolean).join(" "),

      patient_name: [
        app.patient?.first_name,
        app.patient?.middle_name,
        app.patient?.last_name
      ].filter(Boolean).join(" "),

      doctor_email: app.doctor?.email || null,
      patient_email: app.patient?.email || null,
      doctor_phone: app.doctor?.phone_no || null,
      patient_phone: app.patient?.phone_no || null,
      doctor_gender: app.doctor?.doctor_detail?.genderLookup?.domain_name || null,
      patient_gender: app.patient?.patient_detail?.genderLookup?.domain_name || null,
      specialization:
        app.doctor?.doctor_specializations?.[0]?.specializationLookup?.domain_name || null,

      booking_date: app.booking_date,
      booking_time: app.booking_time,
      description: app.description,
      document_id: app.document_id,
      booking_status: app.booking_status,
      booking_status_name: "Booking Initiated",

      doctor_slot: app.availability
        ? `${app.availability.start_time} - ${app.availability.end_time}`
        : null,

      fees: app.availability?.fees || null,

      created_on: app.created_on
        ? app.created_on.toISOString().split("T")[0]
        : null,

      created_by: app.created_by
    }));

    return {
      success: true,
      message: "Pending appointments fetched successfully",
      data: result
    };
  } catch (error) {
    console.error("GET ADMIN PENDING APPOINTMENTS ERROR:", error);

    return {
      success: false,
      message: error.message,
      data: []
    };
  }
}


}

module.exports = AppointmentService;