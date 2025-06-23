
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { sheetId: string } }
) {
  const { sheetId } = params;

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return NextResponse.json(
      { error: 'Las credenciales de Google Sheets no están configuradas en el servidor.' },
      { status: 500 }
    );
  }

  try {
    const auth = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: ['Transacciones!A2:G', 'Categorias!A2:B'],
    });

    const valueRanges = response.data.valueRanges;
    if (!valueRanges) {
      return NextResponse.json(
        { error: 'No se encontraron datos en la hoja de cálculo.' },
        { status: 404 }
      );
    }
    
    const transactions = valueRanges[0]?.values?.map((row: any[]) => ({
      date: row[0] || '',
      description: row[1] || '',
      category: row[2] || '',
      user: row[3] || '',
      paymentMethod: row[4] || '',
      amountARS: parseFloat(row[5]?.replace(/[^0-9.-]+/g,"")) || 0,
      exchangeRate: parseFloat(row[6]?.replace(/[^0-9.-]+/g,"")) || 1,
    })) || [];

    const categories = valueRanges[1]?.values?.map((row: any[]) => ({
      name: row[0] || '',
      budget: parseFloat(row[1]?.replace(/[^0-9.-]+/g,"")) || 0,
    })) || [];

    return NextResponse.json({ transactions, categories });
    
  } catch (error: any) {
    console.error('Google Sheets API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al conectar con Google Sheets.' },
      { status: 500 }
    );
  }
}
