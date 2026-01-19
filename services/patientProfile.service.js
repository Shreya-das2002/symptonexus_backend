const Patient = require("../models/patient");
const PatientDetails = require("../models/Patient_Details");
const DomainLookup = require("../models/Domain_lookup");

class PatientProfileService {

  // ================= GET PROFILE =================
  static async getProfile(patient_id) {

    const patient = await Patient.findOne({
      where: { patient_id },

      include: [{
        model: PatientDetails,
        attributes: [
          'gender',
          'dob',
          'blood_group',
          'height',
          'weight',
          'current_address',
          'permanent_address'
        ],
        include: [{
          model: DomainLookup,
          as: 'genderLookup',
          attributes: ['domain_value']
        }]
      }]
    });


    if (!patient) return null;

    const detail = patient.PatientDetails;


    return {
      patient_id: patient.patient_id,
      first_name: patient.first_name,
      middle_name: patient.middle_name,
      last_name: patient.last_name,
      email: patient.email,
      phone_no: patient.phone_no,

      patient_detail: {
        dob: detail?.dob || "",
        gender: detail?.genderLookup?.domain_value || "",   //  TEXT value
        blood_group: detail?.blood_group || "",
        allergies: detail?.allergies || "",
        height: detail?.height || "",
        weight: detail?.weight || "",
        current_address: detail?.current_address || "",
        permanent_address: detail?.permanent_address || ""
      }
    };
  }

  // ================= SAVE PROFILE =================
  static async saveProfile(patient_id, payload) {

    const {
      dob,
      bloodGroup,
      height,
      weight,
      currentAddress,
      permanentAddress
    } = payload;

    let details = await PatientDetails.findOne({ where: { patient_id } });

    if (!details) {
      details = await PatientDetails.create({ patient_id });
    }

    await details.update({
      dob,
      blood_group: bloodGroup,
      height,
      weight,
      current_address: currentAddress,
      permanent_address: permanentAddress
    });
  }
}

module.exports = PatientProfileService;
