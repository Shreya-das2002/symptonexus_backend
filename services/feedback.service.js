const PatientFeedback = require("../models/Patient_Feedback");
const DoctorFeedback = require("../models/Doctor_Feedback");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Role = require("../models/Role");
const DoctorSpecialization = require("../models/Doctor_specalization");
const DomainLookup = require("../models/Domain_lookup");


class FeedbackService {

  /* =====================================================
      CREATE PATIENT FEEDBACK
  ===================================================== */

static async createPatientFeedback(payload) {
  try {
    const {
      patient_id,
      appointment_id,

      overallRating,
      experience,

      areaRatings = {},

      ai_accuracy,
      website,
      booking,
      doc_communication,
      doc_professionalism,
      waiting,
      quality,
      staff,

      recommend,
      recommendation,

      consultedDoctor,
      consultation,

      desc,
      websiteExperience,
    } = payload;

    /* =====================================================
        CONVERT BOOLEAN VALUES
    ===================================================== */

    const parseBoolean = (value) => {
      if (
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "true" ||
        String(value).toLowerCase() === "yes"
      ) {
        return true;
      }

      if (
        value === false ||
        value === 0 ||
        value === "0" ||
        String(value).toLowerCase() === "false" ||
        String(value).toLowerCase() === "no"
      ) {
        return false;
      }

      return null;
    };

    /* =====================================================
        CONVERT RATING VALUES
    ===================================================== */

    const parseRating = (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      const rating = Number(value);

      if (!Number.isInteger(rating)) {
        return null;
      }

      return rating;
    };

    const isValidRating = (rating) => {
      return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    };

    const consultationValue = parseBoolean(
      consultation !== undefined ? consultation : consultedDoctor
    );

    const recommendationValue = parseBoolean(
      recommendation !== undefined ? recommendation : recommend
    );

    /* =====================================================
        GENERAL RATINGS
    ===================================================== */

    const experienceRating = parseRating(
      experience !== undefined ? experience : overallRating
    );

    const aiAccuracyRating = parseRating(
      ai_accuracy !== undefined
        ? ai_accuracy
        : areaRatings["AI Symptom Checker Accuracy"]
    );

    const websiteRating = parseRating(
      website !== undefined ? website : areaRatings["Website Design & UI"]
    );

    /* =====================================================
        CONSULTATION RATINGS
        IMPORTANT:
        If consultation is No, all these values must be null.
    ===================================================== */

    const bookingRating =
      consultationValue === true
        ? parseRating(
            booking !== undefined ? booking : areaRatings["Ease of Booking"]
          )
        : null;

    const doctorCommunicationRating =
      consultationValue === true
        ? parseRating(
            doc_communication !== undefined
              ? doc_communication
              : areaRatings["Doctor Communication"]
          )
        : null;

    const doctorProfessionalismRating =
      consultationValue === true
        ? parseRating(
            doc_professionalism !== undefined
              ? doc_professionalism
              : areaRatings["Doctor Professionalism"]
          )
        : null;

    const waitingRating =
      consultationValue === true
        ? parseRating(
            waiting !== undefined ? waiting : areaRatings["Waiting Time"]
          )
        : null;

    const qualityRating =
      consultationValue === true
        ? parseRating(
            quality !== undefined
              ? quality
              : areaRatings["Quality of Consultation"]
          )
        : null;

    const staffRating =
      consultationValue === true
        ? parseRating(
            staff !== undefined ? staff : areaRatings["Staff Behaviour"]
          )
        : null;

    /* =====================================================
        PREPARE FEEDBACK DATA
    ===================================================== */

    const feedbackData = {
      patient_id: Number(patient_id),

      appointment_id:
        consultationValue === true && appointment_id
          ? Number(appointment_id)
          : null,

      experience: experienceRating,

      booking: bookingRating,

      doc_communication: doctorCommunicationRating,

      doc_professionalism: doctorProfessionalismRating,

      waiting: waitingRating,

      quality: qualityRating,

      staff: staffRating,

      ai_accuracy: aiAccuracyRating,

      website: websiteRating,

      recommendation: recommendationValue,

      consultation: consultationValue,

      desc:
        String(desc !== undefined ? desc : websiteExperience || "").trim() ||
        null,
    };

    /* =====================================================
        REQUIRED FIELD VALIDATION
    ===================================================== */

    if (
      !Number.isInteger(feedbackData.patient_id) ||
      feedbackData.patient_id <= 0
    ) {
      return {
        success: false,
        message: "Valid patient_id is required",
        statusCode: 400,
      };
    }

    if (feedbackData.consultation === null) {
      return {
        success: false,
        message: "Consultation selection is required",
        statusCode: 400,
      };
    }

    if (feedbackData.recommendation === null) {
      return {
        success: false,
        message: "Recommendation selection is required",
        statusCode: 400,
      };
    }

    /* =====================================================
        GENERAL RATING VALIDATION
        These are always required.
    ===================================================== */

    const generalRatings = [
      {
        name: "Overall experience",
        value: feedbackData.experience,
      },
      {
        name: "AI Symptom Checker Accuracy",
        value: feedbackData.ai_accuracy,
      },
      {
        name: "Website Design & UI",
        value: feedbackData.website,
      },
    ];

    for (const rating of generalRatings) {
      if (!isValidRating(rating.value)) {
        return {
          success: false,
          message: `${rating.name} rating must be between 1 and 5`,
          statusCode: 400,
        };
      }
    }

    /* =====================================================
        CONSULTATION VALIDATION
        Only required when patient selected Yes.
    ===================================================== */

    if (feedbackData.consultation === true) {
      if (
        !Number.isInteger(feedbackData.appointment_id) ||
        feedbackData.appointment_id <= 0
      ) {
        return {
          success: false,
          message: "Appointment is required when doctor was consulted",
          statusCode: 400,
        };
      }

      const consultationRatings = [
        {
          name: "Ease of Booking",
          value: feedbackData.booking,
        },
        {
          name: "Doctor Communication",
          value: feedbackData.doc_communication,
        },
        {
          name: "Doctor Professionalism",
          value: feedbackData.doc_professionalism,
        },
        {
          name: "Waiting Time",
          value: feedbackData.waiting,
        },
        {
          name: "Quality of Consultation",
          value: feedbackData.quality,
        },
        {
          name: "Staff Behaviour",
          value: feedbackData.staff,
        },
      ];

      for (const rating of consultationRatings) {
        if (!isValidRating(rating.value)) {
          return {
            success: false,
            message: `${rating.name} rating must be between 1 and 5`,
            statusCode: 400,
          };
        }
      }
    }

    /* =====================================================
        CHECK PATIENT
    ===================================================== */

    const patient = await Patient.findByPk(feedbackData.patient_id);

    if (!patient) {
      return {
        success: false,
        message: "Patient not found",
        statusCode: 404,
      };
    }

    /* =====================================================
        CHECK APPOINTMENT
        Only check appointment when consultation is Yes.
        If consultation is No, appointment_id is null and skipped.
    ===================================================== */

    if (feedbackData.consultation === true) {
      const appointment = await Appointment.findOne({
        where: {
          appointment_id: feedbackData.appointment_id,
          patient_id: feedbackData.patient_id,
        },
      });

      if (!appointment) {
        return {
          success: false,
          message: "Selected appointment does not belong to this patient",
          statusCode: 400,
        };
      }
    }

    /* =====================================================
        CREATE FEEDBACK
    ===================================================== */

    const feedback = await PatientFeedback.create(feedbackData);

    return {
      success: true,
      message: "Patient feedback submitted successfully",
      data: {
        patient_feedback_id: feedback.patient_feedback_id,
        patient_id: feedback.patient_id,
        appointment_id: feedback.appointment_id,

        experience: feedback.experience,

        booking: feedback.booking,
        doc_communication: feedback.doc_communication,
        doc_professionalism: feedback.doc_professionalism,
        waiting: feedback.waiting,
        quality: feedback.quality,
        staff: feedback.staff,

        ai_accuracy: feedback.ai_accuracy,
        website: feedback.website,

        recommendation: feedback.recommendation,
        consultation: feedback.consultation,

        desc: feedback.desc,
      },
    };
  } catch (error) {
    console.error("CREATE PATIENT FEEDBACK ERROR:", error);

    return {
      success: false,
      message: error.message || "Failed to create patient feedback",
      statusCode: 500,
    };
  }
}
  /* =====================================================
      CREATE DOCTOR FEEDBACK
  ===================================================== */

  static async createDoctorFeedback(payload) {

    try {

      const {
        doctor_id,

        overallRating,
        experience,

        areaRatings = {},

        website,
        management,
        p_info,
        system_performance,
        support_service,
        p_cooperation,
        staff,

        recommend,
        recommendation,

        desc
      } = payload;


      /* =====================================================
          CONVERT BOOLEAN VALUES
      ===================================================== */

      const parseBoolean = (value) => {

        if (
          value === true ||
          value === 1 ||
          value === "1" ||
          String(value).toLowerCase() === "true" ||
          String(value).toLowerCase() === "yes"
        ) {
          return true;
        }

        if (
          value === false ||
          value === 0 ||
          value === "0" ||
          String(value).toLowerCase() === "false" ||
          String(value).toLowerCase() === "no"
        ) {
          return false;
        }

        return null;
      };


      /* =====================================================
          CONVERT RATING VALUES
      ===================================================== */

      const parseRating = (value) => {

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return null;
        }

        const rating = Number(value);

        if (!Number.isInteger(rating)) {
          return null;
        }

        return rating;
      };


      const isValidRating = (rating) => {

        return (
          Number.isInteger(rating) &&
          rating >= 1 &&
          rating <= 5
        );

      };


      const recommendationValue = parseBoolean(
        recommendation !== undefined
          ? recommendation
          : recommend
      );


      /* =====================================================
          PREPARE FEEDBACK DATA
      ===================================================== */

      const feedbackData = {

        doctor_id: Number(doctor_id),

        experience: parseRating(
          experience !== undefined
            ? experience
            : overallRating
        ),

        website: parseRating(
          website !== undefined
            ? website
            : areaRatings["Website Design & UI"]
        ),

        management: parseRating(
          management !== undefined
            ? management
            : areaRatings["Appointment Management"]
        ),

        p_info: parseRating(
          p_info !== undefined
            ? p_info
            : areaRatings["Patient Information"]
        ),

        system_performance: parseRating(
          system_performance !== undefined
            ? system_performance
            : areaRatings["System Performance"]
        ),

        support_service: parseRating(
          support_service !== undefined
            ? support_service
            : areaRatings["Support Service"]
        ),

        p_cooperation: parseRating(
          p_cooperation !== undefined
            ? p_cooperation
            : areaRatings["Patient Cooperation"]
        ),

        staff: parseRating(
          staff !== undefined
            ? staff
            : areaRatings["Staff Behaviour"]
        ),

        recommendation: recommendationValue,

        desc

      };


      /* =====================================================
          VALIDATE RATINGS
      ===================================================== */

      const ratingFields = [
        "experience",
        "website",
        "management",
        "p_info",
        "system_performance",
        "support_service",
        "p_cooperation",
        "staff"
      ];

      for (const field of ratingFields) {

        if (!isValidRating(feedbackData[field])) {

          return {
            success: false,
            message: `${field} must be an integer between 1 and 5`,
            statusCode: 400
          };

        }

      }


      /* =====================================================
          CHECK DOCTOR
      ===================================================== */

      const doctor = await Doctor.findByPk(
        feedbackData.doctor_id
      );

      if (!doctor) {

        return {
          success: false,
          message: "Doctor not found",
          statusCode: 404
        };

      }


      /* =====================================================
          CREATE FEEDBACK
      ===================================================== */

      const feedback = await DoctorFeedback.create(
        feedbackData
      );


      return {

        success: true,

        message: "Doctor feedback submitted successfully",

        data: {

          doctor_feedback_id:
            feedback.doctor_feedback_id,

          doctor_id:
            feedback.doctor_id,

          experience:
            feedback.experience,

          website:
            feedback.website,

          management:
            feedback.management,

          p_info:
            feedback.p_info,

          system_performance:
            feedback.system_performance,

          support_service:
            feedback.support_service,

          p_cooperation:
            feedback.p_cooperation,

          staff:
            feedback.staff,

          recommendation:
            feedback.recommendation,

          desc:
            feedback.desc

        }

      };

    }

    catch (error) {

      console.error(
        "CREATE DOCTOR FEEDBACK ERROR:",
        error
      );


      return {

        success: false,

        message: error.message,

        statusCode: 500

      };

    }

  }
  
/* =====================================================
    GET ALL PATIENT FEEDBACKS
===================================================== */

static async getAllPatientFeedbacks() {
  try {
    const feedbacks = await PatientFeedback.findAll({
      include: [
        {
          model: Patient,
          as: "patient",
          attributes: [
            "patient_id",
            "first_name",
            "middle_name",
            "last_name"
          ],
          required: false
        },

        {
          model: Appointment,
          as: "appointment",
          attributes: [
            "appointment_id",
            "appointment_no",
            "doctor_id",
            "booking_date",
            "booking_status"
          ],
          required: false,

          include: [
            {
              model: Doctor,
              as: "doctor",
              attributes: [
                "doctor_id",
                "doctor_no",
                "first_name",
                "middle_name",
                "last_name",
                "email",
                "phone_no"
              ],
              required: false,

              include: [
                {
                  model: DoctorSpecialization,
                  as: "doctor_specializations",
                  attributes: [
                    "specialization_id"
                  ],
                  required: false,

                  include: [
                    {
                      model: DomainLookup,
                      as: "specializationLookup",
                      attributes: [
                        "domain_name",
                        "domain_value"
                      ],
                      where: {
                        domain_type: "specialization"
                      },
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],

      order: [["patient_feedback_id", "DESC"]]
    });

    const result = await Promise.all(
      feedbacks.map(async (feedbackRow) => {
        const feedback = feedbackRow.get({ plain: true });

        const patientName = [
          feedback.patient?.first_name,
          feedback.patient?.middle_name,
          feedback.patient?.last_name
        ]
          .filter(Boolean)
          .join(" ");

        const doctorName = [
          feedback.appointment?.doctor?.first_name,
          feedback.appointment?.doctor?.middle_name,
          feedback.appointment?.doctor?.last_name
        ]
          .filter(Boolean)
          .join(" ");

        const patientUser = await User.findOne({
          where: {
            ref_id: feedback.patient_id,
            user_type: 5
          },
          attributes: [
            "user_id",
            "user_name",
            "user_type",
            "status"
          ],
          include: [
            {
              model: DomainLookup,
              as: "userTypeLookup",
              attributes: [
                "domain_name",
                "domain_value"
              ],
              where: {
                domain_type: "user_type"
              },
              required: false
            }
          ]
        });

        const doctorSpecialization =
          feedback.appointment?.doctor?.doctor_specializations?.[0] || null;

        return {
          patient_feedback_id: feedback.patient_feedback_id,
          patient_id: feedback.patient_id,
          appointment_id: feedback.appointment_id,

          experience: feedback.experience,
          booking: feedback.booking,
          doc_communication: feedback.doc_communication,
          doc_professionalism: feedback.doc_professionalism,
          waiting: feedback.waiting,
          quality: feedback.quality,
          staff: feedback.staff,
          ai_accuracy: feedback.ai_accuracy,
          website: feedback.website,
          recommendation: feedback.recommendation,
          consultation: feedback.consultation,
          desc: feedback.desc,

          patient_name: patientName || null,

          user_id: patientUser?.user_id || null,
          user_name: patientUser?.user_name || null,
          user_type_id: patientUser?.user_type || null,
          user_type: patientUser?.userTypeLookup?.domain_name || null,
          user_status: patientUser?.status || null,

          doctor_id: feedback.appointment?.doctor?.doctor_id || null,
          doctor_name: doctorName || null,
          doctor_email: feedback.appointment?.doctor?.email || null,
          doctor_phone: feedback.appointment?.doctor?.phone_no || null,

          specialization_id:
            doctorSpecialization?.specialization_id || null,

          specialization:
            doctorSpecialization?.specializationLookup?.domain_name || null,

          appointment_no: feedback.appointment?.appointment_no || null,
          booking_date: feedback.appointment?.booking_date || null,
          booking_status: feedback.appointment?.booking_status || null
        };
      })
    );

    return {
      success: true,
      message: "Patient feedback list fetched successfully",
      data: result
    };
  } catch (error) {
    console.error("GET ALL PATIENT FEEDBACKS ERROR:", error);

    return {
      success: false,
      message: error.message,
      statusCode: 500
    };
  }
}


/* =====================================================
    GET ALL DOCTOR FEEDBACKS
    No patient information returned
===================================================== */

static async getAllDoctorFeedbacks() {
  try {
    const feedbacks = await DoctorFeedback.findAll({
      include: [
        {
          model: Doctor,
          as: "doctor",
          attributes: [
            "doctor_id",
            "doctor_no",
            "first_name",
            "middle_name",
            "last_name",
            "email",
            "phone_no"
          ],
          required: false,

          include: [
            {
              model: DoctorSpecialization,
              as: "doctor_specializations",
              attributes: [
                "specialization_id"
              ],
              required: false,

              include: [
                {
                  model: DomainLookup,
                  as: "specializationLookup",
                  attributes: [
                    "domain_name",
                    "domain_value"
                  ],
                  where: {
                    domain_type: "specialization"
                  },
                  required: false
                }
              ]
            }
          ]
        }
      ],

      order: [["doctor_feedback_id", "DESC"]]
    });

    const result = await Promise.all(
      feedbacks.map(async (feedbackRow) => {
        const feedback = feedbackRow.get({ plain: true });

        const doctorName = [
          feedback.doctor?.first_name,
          feedback.doctor?.middle_name,
          feedback.doctor?.last_name
        ]
          .filter(Boolean)
          .join(" ");

        /*
         * IMPORTANT:
         * ref_id can match patient_id also.
         * So doctor user must be filtered with user_type: 4.
         *
         * domain_lookup:
         * Doctor = 4
         * Patient = 5
         */

        const doctorUser = await User.findOne({
          where: {
            ref_id: feedback.doctor_id,
            user_type: 4
          },
          attributes: [
            "user_id",
            "user_name",
            "user_type",
            "status"
          ],
          include: [
            {
              model: DomainLookup,
              as: "userTypeLookup",
              attributes: [
                "domain_name",
                "domain_value"
              ],
              where: {
                domain_type: "user_type"
              },
              required: false
            }
          ]
        });

        const doctorSpecialization =
          feedback.doctor?.doctor_specializations?.[0] || null;

        return {
          doctor_feedback_id: feedback.doctor_feedback_id,
          doctor_id: feedback.doctor_id,

          experience: feedback.experience,
          website: feedback.website,
          management: feedback.management,
          p_info: feedback.p_info,
          system_performance: feedback.system_performance,
          support_service: feedback.support_service,
          p_cooperation: feedback.p_cooperation,
          staff: feedback.staff,
          recommendation: feedback.recommendation,
          desc: feedback.desc,

          doctor_name: doctorName || null,
          doctor_email: feedback.doctor?.email || null,
          doctor_phone: feedback.doctor?.phone_no || null,

          user_id: doctorUser?.user_id || null,
          user_name: doctorUser?.user_name || null,
          user_type_id: doctorUser?.user_type || null,
          user_type: doctorUser?.userTypeLookup?.domain_name || null,
          user_status: doctorUser?.status || null,

          specialization_id:
            doctorSpecialization?.specialization_id || null,

          specialization:
            doctorSpecialization?.specializationLookup?.domain_name || null
        };
      })
    );

    return {
      success: true,
      message: "Doctor feedback list fetched successfully",
      data: result
    };
  } catch (error) {
    console.error("GET ALL DOCTOR FEEDBACKS ERROR:", error);

    return {
      success: false,
      message: error.message,
      statusCode: 500
    };
  }
}
}


module.exports = FeedbackService;