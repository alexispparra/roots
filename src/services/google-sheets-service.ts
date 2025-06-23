import { google } from "googleapis";

// Define el rango de celdas que quieres leer. Por ejemplo: 'A1:D10'
// Si lo dejas vacío, intentará leer toda la primera hoja.
const SHEET_RANGE = "A1:Z1000";

export async function getSheetData() {
  try {
    const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const sheet_id = process.env.GOOGLE_SHEETS_SHEET_ID;

    if (!client_email || !private_key || !sheet_id) {
      console.log("Faltan variables de entorno de Google Sheets.");
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: client_email,
        private_key: private_key.replace(/\\n/g, '\n'),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet_id,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      const header = rows[0];
      const dataRows = rows.slice(1);
      return { header, rows: dataRows };
    }
    return { header: [], rows: [] };
  } catch (err) {
    console.error("Error al leer la hoja de cálculo:", err);
    return null;
  }
}
