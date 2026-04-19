const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const Appointment = require("../models/Appointment");
const generatePdfFromHtml = require("../utils/generatePdf");

class PrescriptionPdfService {
  static extractPrescriptionData(storedHtml) {
    const $ = cheerio.load(storedHtml);

    const doctorName =
      $("h2").first().text().trim() || "-";

    const specialization =
      $("h2").first().next("p").text().trim() || "-";

    const allParagraphs = $("p").toArray().map((el) => $(el).text().trim());

    const licenseLine =
      allParagraphs.find((t) => t.includes("License No:")) || "";
    const regLine =
      allParagraphs.find((t) => t.includes("Reg No:")) || "";

    const doctorBio =
      allParagraphs.find(
        (t) =>
          t &&
          !t.includes("License No:") &&
          !t.includes("Reg No:") &&
          t !== specialization &&
          !t.includes("Smart Healthcare") &&
          !t.includes("Trusted Care")
      ) || "";

    const tdTexts = $("td")
      .toArray()
      .map((el) => $(el).text().trim())
      .filter(Boolean);

    const patientName = tdTexts[1] || "-";
    const age = tdTexts[3] || "-";
    const gender = tdTexts[5] || "-";
    const date = tdTexts[7] || "-";

    const prescriptionBody =
      $('div[style*="min-height:420px"]').first().html() || "<p>-</p>";

    return {
      doctorName,
      specialization,
      licenseNo: licenseLine.replace("License No:", "").trim() || "-",
      regNo: regLine.replace("Reg No:", "").trim() || "-",
      doctorBio,
      patientName,
      age,
      gender,
      date,
      prescriptionBody,
    };
  }
static buildCleanPrescriptionHtml(data, logoSrc) {
  return `
  <html>
    <head>
      <meta charset="UTF-8" />
    </head>

    <body style="
      margin:0;
      padding:0;
      background:#dbeafe;
      font-family:Arial, sans-serif;
    ">
      <div style="
        width:794px;
        min-height:1123px;
        margin:0 auto;
        background:#ffffff;
        position:relative;
        box-sizing:border-box;
        overflow:hidden;
      ">

        <!-- HEADER -->
        <div style="
          position:relative;
          height:190px;
          overflow:hidden;
          background:linear-gradient(to right, #2ea8cf, #0d5f7a);
        ">
          <div style="
            position:absolute;
            left:0;
            top:0;
            width:36%;
            height:100%;
            background:#eaf4f7;
            border-bottom-right-radius:170px;
            box-sizing:border-box;
            padding:22px 24px;
            z-index:2;
          ">
            <h2 style="
              margin:0 0 8px 0;
              font-size:22px;
              font-weight:700;
              color:#0f5b79;
              line-height:1.1;
            ">
              ${String(data.doctorName || "-").replace(/^Dr\.?\s*/i, "")}
            </h2>

            <p style="
              margin:0 0 10px 0;
              font-size:13px;
              color:#475569;
            ">
              ${data.specialization || "-"}
            </p>

            <p style="
              margin:0 0 5px 0;
              font-size:12px;
              color:#0f172a;
            ">
              <strong>License No:</strong> ${data.licenseNo || "-"}
            </p>

            <p style="
              margin:0 0 6px 0;
              font-size:12px;
              color:#0f172a;
            ">
              <strong>Reg No:</strong> ${data.regNo || "-"}
            </p>

            <p style="
              margin:0;
              font-size:11px;
              color:#475569;
              line-height:1.4;
            ">
              ${data.doctorBio || ""}
            </p>
          </div>

          <div style="
            position:absolute;
            left:36%;
            top:0;
            width:64%;
            height:100%;
            box-sizing:border-box;
            padding:28px 28px 20px 42px;
            color:#ffffff;
          ">
            <div style="
              display:flex;
              align-items:center;
              gap:10px;
              margin-bottom:14px;
            ">
              <img
                src="${logoSrc}"
                style="
                  width:46px;
                  height:46px;
                  object-fit:contain;
                  display:block;
                "
              />
              <div style="
                font-size:11px;
                letter-spacing:2px;
                line-height:1.35;
                color:#ffffff;
              ">
                <div>SMART HEALTHCARE</div>
                <div>TRUSTED CARE</div>
              </div>
            </div>

            <div style="
              font-family:Georgia, 'Times New Roman', serif;
              font-size:34px;
              line-height:1.08;
              color:#f8fafc;
              white-space:nowrap;
              margin-top:8px;
            ">
              SymptoNexus Clinic
            </div>
          </div>
        </div>

        <!-- PATIENT INFO -->
        <div style="
          padding:18px 18px 16px 18px;
          border-bottom:2px solid #38bdf8;
          background:#ffffff;
        ">
          <table style="
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
          ">
            <tr>
              <td style="
                width:18%;
                font-size:11px;
                font-weight:700;
                color:#0f172a;
                white-space:nowrap;
                padding-right:6px;
              ">Patient's Name:</td>

              <td style="
                width:24%;
                font-size:11px;
                color:#334155;
                border-bottom:1px solid #94a3b8;
                padding:0 4px 5px 4px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
              ">${data.patientName || "-"}</td>

              <td style="
                width:8%;
                font-size:11px;
                font-weight:700;
                color:#0f172a;
                white-space:nowrap;
                text-align:right;
                padding:0 6px 5px 12px;
              ">Age:</td>

              <td style="
                width:8%;
                font-size:11px;
                color:#334155;
                border-bottom:1px solid #94a3b8;
                padding:0 4px 5px 4px;
                white-space:nowrap;
              ">${data.age || "-"}</td>

              <td style="
                width:10%;
                font-size:11px;
                font-weight:700;
                color:#0f172a;
                white-space:nowrap;
                text-align:right;
                padding:0 6px 5px 12px;
              ">Gender:</td>

              <td style="
                width:12%;
                font-size:11px;
                color:#334155;
                border-bottom:1px solid #94a3b8;
                padding:0 4px 5px 4px;
                white-space:nowrap;
              ">${data.gender || "-"}</td>

              <td style="
                width:8%;
                font-size:11px;
                font-weight:700;
                color:#0f172a;
                white-space:nowrap;
                text-align:right;
                padding:0 6px 5px 12px;
              ">Date:</td>

              <td style="
                width:12%;
                font-size:11px;
                color:#334155;
                border-bottom:1px solid #94a3b8;
                padding:0 4px 5px 4px;
                white-space:nowrap;
              ">${data.date || "-"}</td>
            </tr>
          </table>
        </div>

        <!-- PRESCRIPTION BODY -->
        <div style="
          padding:28px 28px 90px 28px;
          min-height:760px;
          box-sizing:border-box;
          font-size:18px;
          line-height:1.8;
          color:#334155;
          background:#ffffff;
        ">
          ${data.prescriptionBody || "<p>-</p>"}
        </div>

        <!-- FOOTER -->
        <div style="
          position:absolute;
          left:0;
          right:0;
          bottom:0;
          background:linear-gradient(to right, #06b6d4, #155e75, #0891b2);
          color:#ffffff;
          padding:12px 18px;
          box-sizing:border-box;
          font-size:11px;
        ">
          <table style="
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
          ">
            <tr>
              <td style="width:31%; white-space:nowrap;">✉️ symptonexus333@gmail.com</td>
              <td style="width:23%; white-space:nowrap; text-align:center;">📍 Krishnanagar, Nadia</td>
              <td style="width:23%; white-space:nowrap; text-align:center;">📞 +91 98765 43210</td>
              <td style="width:23%; white-space:nowrap; text-align:right;">🌐 SymptoNexus</td>
            </tr>
          </table>
        </div>

      </div>
    </body>
  </html>
  `;
}
  static async generatePrescriptionPdf(appointmentId, patientId) {
    try {
      const appointment = await Appointment.findOne({
        where: {
          appointment_id: appointmentId,
          patient_id: patientId,
        },
      });

      if (!appointment) {
        return { success: false, message: "Appointment not found" };
      }

      if (!appointment.prescription) {
        return { success: false, message: "Prescription not found" };
      }

      const logoPath = path.join(process.cwd(), "assets", "logo_outlined.png");
      const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
      const logoSrc = `data:image/png;base64,${logoBase64}`;

      const extractedData = this.extractPrescriptionData(appointment.prescription);
      const finalHtml = this.buildCleanPrescriptionHtml(extractedData, logoSrc);
      const pdfBuffer = await generatePdfFromHtml(finalHtml);

      return {
        success: true,
        message: "Prescription PDF generated successfully",
        data: pdfBuffer,
      };
    } catch (error) {
      console.error("PRESCRIPTION PDF SERVICE ERROR:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = PrescriptionPdfService;