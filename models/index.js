const sequelize = require("../config/database");

const Doctor = require("./Doctor");
const DoctorDetail = require("./Doctor_Details");
const DoctorSpecialization = require("./Doctor_specalization");
const DoctorExperience = require("./Doctor_experience");

const Patient = require("./patient");
const PatientDetails = require("./Patient_Details");

const Address = require("./Address");
const DomainLookup = require("./Domain_lookup");
const User = require("./User");
const Role = require("./Role");
const ControlMaster = require("./Control_master");
const ControlRoleMapping = require("./Control_role_mapping");
const UserRoleMapping = require("./User_role_mapping");


Patient.hasOne(PatientDetails, { foreignKey: "patient_id" });
PatientDetails.belongsTo(Patient, { foreignKey: "patient_id" });

Doctor.hasOne(DoctorDetail, { foreignKey: "doctor_id" });
DoctorDetail.belongsTo(Doctor, { foreignKey: "doctor_id" });

Doctor.hasMany(DoctorSpecialization, { foreignKey: "doctor_id" });
DoctorSpecialization.belongsTo(Doctor, { foreignKey: "doctor_id" });

Doctor.hasMany(DoctorExperience, { foreignKey: "doctor_id" });
DoctorExperience.belongsTo(Doctor, { foreignKey: "doctor_id" });

Patient.hasOne(PatientDetails, { foreignKey: "patient_id" });
PatientDetails.belongsTo(Patient, { foreignKey: "patient_id" });

Address.hasMany(PatientDetails, { foreignKey: "current_address_id" });
Address.hasMany(PatientDetails, { foreignKey: "permanent_address_id" });

PatientDetails.belongsTo(Address, { foreignKey: "current_address_id", as: "CurrentAddress" });
PatientDetails.belongsTo(Address, { foreignKey: "permanent_address_id", as: "PermanentAddress" });

// DomainLookup.hasMany(PatientDetails, { foreignKey: "blood_group" });
// DomainLookup.hasMany(PatientDetails, { foreignKey: "gender" });

PatientDetails.belongsTo(DomainLookup, { foreignKey: "blood_group", as: "BloodGroup" });
PatientDetails.belongsTo(DomainLookup, { foreignKey: "gender", as: "Gender" });


User.belongsToMany(Role, { through: UserRoleMapping, foreignKey: "user_id" });
Role.belongsToMany(User, { through: UserRoleMapping, foreignKey: "role_id" });

Role.belongsToMany(ControlMaster, { through: ControlRoleMapping, foreignKey: "role_id" });
ControlMaster.belongsToMany(Role, { through: ControlRoleMapping, foreignKey: "control_master_id" });


module.exports = {
  sequelize,
  Doctor,
  DoctorDetail,
  DoctorSpecialization,
  DoctorExperience,
  Patient,
  PatientDetails,
  Address,
  DomainLookup,
  Role, 
  ControlMaster,
  User
};
