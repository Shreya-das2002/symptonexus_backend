const Patient = require("../models/patient");
const PatientDetails = require("../models/Patient_Details");
const Address = require("../models/Address");
const sequelize = require("../config/database");

class PatientProfileService {
  async savePatientProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        patient_id,
        current_address,
        permanent_address,
        dob,
        marital_status,
        occupation,
        blood_group,
        height,
        weight,
        allergies,
        smoking,
        alcohol,
      } = payload;

      if (!patient_id) {
        throw new Error("PATIENT_ID_REQUIRED");
      }

      /* ================= SAVE ADDRESSES ================= */

      let currentAddressId = null;
      let permanentAddressId = null;

      if (current_address) {
        const current = await Address.create(
          current_address,
          { transaction: t }
        );
        currentAddressId = current.address_id;
      }

      if (permanent_address) {
        const permanent = await Address.create(
          permanent_address,
          { transaction: t }
        );
        permanentAddressId = permanent.address_id;
      }

      /* ================= UPSERT PATIENT DETAILS ================= */

      const data = {
        patient_id,
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
        dob,
        marital_status,
        occupation,
        blood_group,
        height,
        weight,
        allergies,
        smoking,
        alcohol,
      };

      const existing = await PatientDetails.findOne({
        where: { patient_id },
        transaction: t,
      });

      if (existing) {
        await PatientDetails.update(
          data,
          { where: { patient_id }, transaction: t }
        );
      } else {
        await PatientDetails.create(data, { transaction: t });
      }

      /* ================= FETCH UPDATED DATA ================= */

      const user = await Patient.findOne({
        where: { patient_id },
        attributes: [
          "patient_id",
          "first_name",
          "middle_name",
          "last_name",
          "email",
          "phone_no",
        ],
        transaction: t,
      });

      const details = await PatientDetails.findOne({
        where: { patient_id },
        transaction: t,
      });

      const currentAddress = details?.current_address_id
        ? await Address.findByPk(
            details.current_address_id,
            { transaction: t }
          )
        : null;

      const permanentAddress = details?.permanent_address_id
        ? await Address.findByPk(
            details.permanent_address_id,
            { transaction: t }
          )
        : null;

      const profile = {
        gender: details?.gender ?? null,
        dob: details?.dob ?? null,
        marital_status: details?.marital_status ?? null,
        occupation: details?.occupation ?? null,
        blood_group: details?.blood_group ?? null,
        height: details?.height ?? null,
        weight: details?.weight ?? null,
        allergies: details?.allergies ?? [],
        smoking: details?.smoking ?? null,
        alcohol: details?.alcohol ?? null,
        current_address: currentAddress?.toJSON() || null,
        permanent_address: permanentAddress?.toJSON() || null,
      };

      await t.commit();

      return {
        user: user.toJSON(),
        profile,
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

// export instance
module.exports = new PatientProfileService();
