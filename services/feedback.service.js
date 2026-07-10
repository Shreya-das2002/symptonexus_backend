const PatientFeedback = require("../models/Patient_Feedback");
const Patient = require("../models/patient");
const Appointment = require("../models/Appointment");


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
        websiteExperience
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


      const consultationValue = parseBoolean(
        consultation !== undefined
          ? consultation
          : consultedDoctor
      );


      const recommendationValue = parseBoolean(
        recommendation !== undefined
          ? recommendation
          : recommend
      );


      /* =====================================================
          PREPARE FEEDBACK DATA
      ===================================================== */

      const feedbackData = {

        patient_id: Number(patient_id),

        appointment_id:
          consultationValue === true && appointment_id
            ? Number(appointment_id)
            : null,

        experience: parseRating(
          experience !== undefined
            ? experience
            : overallRating
        ),

        ai_accuracy: parseRating(
          ai_accuracy !== undefined
            ? ai_accuracy
            : areaRatings["AI Symptom Checker Accuracy"]
        ),

        website: parseRating(
          website !== undefined
            ? website
            : areaRatings["Website Design & UI"]
        ),

        consultation: consultationValue,

        booking:
          consultationValue === true
            ? parseRating(
                booking !== undefined
                  ? booking
                  : areaRatings["Ease of Booking"]
              )
            : null,

        doc_communication:
          consultationValue === true
            ? parseRating(
                doc_communication !== undefined
                  ? doc_communication
                  : areaRatings["Doctor Communication"]
              )
            : null,

        doc_professionalism:
          consultationValue === true
            ? parseRating(
                doc_professionalism !== undefined
                  ? doc_professionalism
                  : areaRatings["Doctor Professionalism"]
              )
            : null,

        waiting:
          consultationValue === true
            ? parseRating(
                waiting !== undefined
                  ? waiting
                  : areaRatings["Waiting Time"]
              )
            : null,

        quality:
          consultationValue === true
            ? parseRating(
                quality !== undefined
                  ? quality
                  : areaRatings["Quality of Consultation"]
              )
            : null,

        staff:
          consultationValue === true
            ? parseRating(
                staff !== undefined
                  ? staff
                  : areaRatings["Staff Behaviour"]
              )
            : null,

        recommendation: recommendationValue,

        desc:
          String(
            desc !== undefined
              ? desc
              : websiteExperience || ""
          ).trim() || null

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
          statusCode: 400
        };

      }


      if (feedbackData.consultation === null) {

        return {
          success: false,
          message: "Consultation selection is required",
          statusCode: 400
        };

      }


      if (feedbackData.recommendation === null) {

        return {
          success: false,
          message: "Recommendation selection is required",
          statusCode: 400
        };

      }


      /* =====================================================
          GENERAL RATING VALIDATION
      ===================================================== */

      const generalRatings = [

        {
          name: "Overall experience",
          value: feedbackData.experience
        },

        {
          name: "AI Symptom Checker Accuracy",
          value: feedbackData.ai_accuracy
        },

        {
          name: "Website Design & UI",
          value: feedbackData.website
        }

      ];


      for (const rating of generalRatings) {

        if (!isValidRating(rating.value)) {

          return {
            success: false,
            message: `${rating.name} rating must be between 1 and 5`,
            statusCode: 400
          };

        }

      }


      /* =====================================================
          CONSULTATION RATING VALIDATION
      ===================================================== */

      if (feedbackData.consultation === true) {

        if (
          !Number.isInteger(feedbackData.appointment_id) ||
          feedbackData.appointment_id <= 0
        ) {

          return {
            success: false,
            message: "Appointment is required when doctor was consulted",
            statusCode: 400
          };

        }


        const consultationRatings = [

          {
            name: "Ease of Booking",
            value: feedbackData.booking
          },

          {
            name: "Doctor Communication",
            value: feedbackData.doc_communication
          },

          {
            name: "Doctor Professionalism",
            value: feedbackData.doc_professionalism
          },

          {
            name: "Waiting Time",
            value: feedbackData.waiting
          },

          {
            name: "Quality of Consultation",
            value: feedbackData.quality
          },

          {
            name: "Staff Behaviour",
            value: feedbackData.staff
          }

        ];


        for (const rating of consultationRatings) {

          if (!isValidRating(rating.value)) {

            return {
              success: false,
              message: `${rating.name} rating must be between 1 and 5`,
              statusCode: 400
            };

          }

        }

      }


      /* =====================================================
          CHECK PATIENT
      ===================================================== */

      const patient = await Patient.findByPk(
        feedbackData.patient_id
      );


      if (!patient) {

        return {
          success: false,
          message: "Patient not found",
          statusCode: 404
        };

      }


      /* =====================================================
          CHECK APPOINTMENT
      ===================================================== */

      if (feedbackData.appointment_id) {

        const appointment = await Appointment.findOne({

          where: {

            appointment_id:
              feedbackData.appointment_id,

            patient_id:
              feedbackData.patient_id

          }

        });


        if (!appointment) {

          return {
            success: false,
            message:
              "Selected appointment does not belong to this patient",
            statusCode: 400
          };

        }

      }


      /* =====================================================
          CREATE FEEDBACK
      ===================================================== */

      const feedback = await PatientFeedback.create(
        feedbackData
      );


      return {

        success: true,

        message: "Patient feedback submitted successfully",

        data: {

          patient_feedback_id:
            feedback.patient_feedback_id,

          patient_id:
            feedback.patient_id,

          appointment_id:
            feedback.appointment_id,

          experience:
            feedback.experience,

          booking:
            feedback.booking,

          doc_communication:
            feedback.doc_communication,

          doc_professionalism:
            feedback.doc_professionalism,

          waiting:
            feedback.waiting,

          quality:
            feedback.quality,

          staff:
            feedback.staff,

          ai_accuracy:
            feedback.ai_accuracy,

          website:
            feedback.website,

          recommendation:
            feedback.recommendation,

          consultation:
            feedback.consultation,

          desc:
            feedback.desc

        }

      };

    }

    catch (error) {

      console.error(
        "CREATE PATIENT FEEDBACK ERROR:",
        error
      );


      return {

        success: false,

        message: error.message,

        statusCode: 500

      };

    }

  }

}


module.exports = FeedbackService;