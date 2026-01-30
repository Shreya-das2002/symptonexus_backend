const Patient = require("../models/patient");
const PatientDetails = require("../models/Patient_Details");
const Address = require("../models/Address");
const sequelize = require("../config/database"); // adjust path if needed

const calculateAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const getPatientProfileService = async (patient_id) => {
  const transaction = await sequelize.transaction();

  try {
    try {
      if (!patient_id) {
        throw new Error("PATIENT_ID_REQUIRED");
      }

      // 1️ BASIC USER INFO
      const user = await Patient.findOne({
        where: { patient_id },
        attributes: [
          "patient_id",
          "first_name",
          "middle_name",
          "last_name",
          "email",
          "phone_no",
          "gender",
        ],
        transaction,
      });

      if (!user) {
        throw new Error("PATIENT_NOT_FOUND");
      }

      // 2️⃣ PATIENT DETAILS
      const details = await PatientDetails.findOne({
        where: { patient_id },
        transaction,
      });

      // 3️⃣ ADDRESSES
      let currentAddress = null;
      let permanentAddress = null;

      if (details?.current_address_id) {
        currentAddress = await Address.findByPk(
          details.current_address_id,
          { transaction }
        );
      }

      if (details?.permanent_address_id) {
        permanentAddress = await Address.findByPk(
          details.permanent_address_id,
          { transaction }
        );
      }

      // 4️⃣ BUILD PROFILE OBJECT
      const profile = {
        dob: details?.dob || null,
        age: calculateAge(details?.dob),
        marital_status: details?.marital_status || null,
        occupation: details?.occupation || null,
        blood_group: details?.blood_group || null,
        height: details?.height || null,
        weight: details?.weight || null,
        allergies: details?.allergies || [],
        smoking: details?.smoking ?? null,
        alcohol: details?.alcohol ?? null,
        current_address: currentAddress,
        permanent_address: permanentAddress,
      };

      await transaction.commit();

      return {
        user: user.toJSON(),
        profile,
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    throw error;
  }
};

module.exports = {
  getPatientProfileService,
};
