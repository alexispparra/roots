import { google } from "googleapis";
import { NextResponse } from "next/server";

const SHEET_RANGE = "A1:Z1000";

export async function GET() {
  try {
    const client_email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const private_key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
    const sheet_id = process.env.GOOGLE_SHEETS_SHEET_ID;

    if (!client_email || !private_key || !sheet_id) {
      return NextResponse.json(
        { error: "Missing Google Sheets environment variables" },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: client_email,
        private_key: private_key.replace(/\\n/g, "\n"),
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
      return NextResponse.json({ header, rows: dataRows });
    }

    return NextResponse.json({ header: [], rows: [] });
  } catch (err) {
    console.error("Error reading spreadsheet:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch sheet data", details: errorMessage },
      { status: 500 }
    );
  }
}
