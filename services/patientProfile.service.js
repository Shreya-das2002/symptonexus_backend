const Patient = require("../models/patient");
const PatientDetails = require("../models/Patient_Details");
const Address = require("../models/Address");
const DomainLookup = require("../models/Domain_lookup");
const sequelize = require("../config/database");

/* ================= ADDRESS BUILDER ================= */

const buildAddress = (addr) => {
  if (!addr) return null;

  const lines =
    typeof addr.address_line === "string"
      ? addr.address_line.split(",").map(s => s.trim())
      : [];

  return {
    address_line_1: lines[0] || null,
    address_line_2: lines[1] || null,
    city: addr.city || null,
    district: addr.district || null,
    state: addr.state || null,
    country: addr.country || null,
    pin: addr.pincode || null,
    status: "Active",
  };
};

/* ================= SERVICE ================= */

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
        blood_group, // STRING like "B-"
        height,
        weight,
        allergies,
        smoking,
        alcohol,
      } = payload;

      if (!patient_id) {
        throw new Error("PATIENT_ID_REQUIRED");
      }

      /* ================= EXISTING DETAILS ================= */

      const existingDetails = await PatientDetails.findOne({
        where: { patient_id },
        transaction: t,
      });

      /* ================= BLOOD GROUP RESOLUTION ================= */

      let bloodGroupId = null;

      if (blood_group) {
        const bg = await DomainLookup.findOne({
          where: {
            domain_type: "blood_group",
            domain_name: blood_group, // "B-"
          },
          transaction: t,
        });

        if (!bg) {
          throw new Error(`INVALID_BLOOD_GROUP: ${blood_group}`);
        }

        bloodGroupId = bg.domain_lookup_id;
      }

      /* ================= ADDRESS HANDLING ================= */

      let currentAddressId = existingDetails?.current_address_id ?? null;
      let permanentAddressId = existingDetails?.permanent_address_id ?? null;

      if (current_address) {
        const addrData = buildAddress(current_address);

        if (currentAddressId) {
          await Address.update(addrData, {
            where: { address_id: currentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(addrData, { transaction: t });
          currentAddressId = addr.address_id;
        }
      }

      if (permanent_address) {
        const addrData = buildAddress(permanent_address);

        if (permanentAddressId) {
          await Address.update(addrData, {
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(addrData, { transaction: t });
          permanentAddressId = addr.address_id;
        }
      }

      /* ================= PATIENT DETAILS DATA ================= */

      const data = {
        dob,
        marital_status,
        occupation,
        height,
        weight,
        allergies,
        smoking,
        alcohol,
        blood_group: bloodGroupId, // ✅ FK SAFE
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (existingDetails) {
        await PatientDetails.update(data, {
          where: { patient_id },
          transaction: t,
        });
      } else {
        await PatientDetails.create(
          { patient_id, ...data },
          { transaction: t }
        );
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
        ? await Address.findByPk(details.current_address_id, { transaction: t })
        : null;

      const permanentAddress = details?.permanent_address_id
        ? await Address.findByPk(details.permanent_address_id, { transaction: t })
        : null;

      await t.commit();

      return {
        success: true,
        user: user.toJSON(),
        profile: {
          dob: details?.dob ?? null,
          marital_status: details?.marital_status ?? null,
          occupation: details?.occupation ?? null,
          blood_group: details?.blood_group ?? null, // number
          height: details?.height ?? null,
          weight: details?.weight ?? null,
          allergies: details?.allergies ?? [],
          smoking: details?.smoking ?? null,
          alcohol: details?.alcohol ?? null,
          current_address: currentAddress?.toJSON() || null,
          permanent_address: permanentAddress?.toJSON() || null,
        },
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new PatientProfileService();
