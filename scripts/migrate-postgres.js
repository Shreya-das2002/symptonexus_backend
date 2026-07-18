require("dotenv").config();

const sequelize = require("../config/database");

async function migratePostgres() {
  const transaction = await sequelize.transaction();

  try {
    const queryInterface = sequelize.getQueryInterface();
    const [userRoleMappingColumns, specializationColumns, domainLookupColumns] = await Promise.all([
      queryInterface.describeTable("user_role_mappings"),
      queryInterface.describeTable("doctor_specializations"),
      queryInterface.describeTable("domain_lookups"),
    ]);

    if (userRoleMappingColumns.status.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "user_role_mappings"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE INTEGER USING CASE
          WHEN "status" IS NULL THEN NULL
          WHEN LOWER(TRIM("status")) IN ('active', '1', 'true') THEN 1
          WHEN LOWER(TRIM("status")) IN ('inactive', '0', 'false') THEN 0
          ELSE NULL
        END,
          ALTER COLUMN "status" SET DEFAULT 1;
      `, { transaction });
    }

    if (specializationColumns.status.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "doctor_specializations"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE INTEGER USING CASE
          WHEN "status" IS NULL THEN NULL
          WHEN LOWER(TRIM("status")) IN ('active', '1', 'true') THEN 1
          WHEN LOWER(TRIM("status")) IN ('inactive', '0', 'false') THEN 0
          ELSE NULL
        END,
          ALTER COLUMN "status" SET DEFAULT 1;
      `, { transaction });
    }

    if (domainLookupColumns.domain_value.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "domain_lookups"
          ALTER COLUMN "domain_value" TYPE INTEGER
          USING NULLIF(TRIM("domain_value"), '')::INTEGER;
      `, { transaction });
    }

    await transaction.commit();
    console.log("PostgreSQL type migration completed");
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
}

migratePostgres().catch((error) => {
  console.error("PostgreSQL type migration failed:", error.message);
  process.exit(1);
});
