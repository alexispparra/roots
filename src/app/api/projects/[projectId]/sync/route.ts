
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getFirebaseInstances } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp, collection } from 'firebase/firestore';
import type { Transaction, Category } from '@/contexts/ProjectsContext';

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  const firebase = getFirebaseInstances();

  if (!firebase) {
    return NextResponse.json({ error: 'Firebase no está configurado.' }, { status: 500 });
  }

  // In a real app, you would add an auth check here to ensure the user
  // has permission to sync this project.

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return NextResponse.json({ error: 'Las credenciales de Google Sheets no están configuradas en el servidor.' }, { status: 500 });
  }

  try {
    const projectRef = doc(firebase.db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404 });
    }

    const projectData = projectDoc.data();
    const sheetId = projectData.googleSheetId;

    if (!sheetId) {
      return NextResponse.json({ error: 'El proyecto no tiene un ID de Google Sheet asociado.' }, { status: 400 });
    }

    // Authenticate with Google Sheets API
    const auth = new google.auth.JWT(clientEmail, undefined, privateKey, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      // Expected columns for Transacciones: Fecha, Descripción, Categoría, Usuario, Monto (ARS), Cambio (a U$S), Tipo (income/expense)
      // Expected columns for Categorias: Nombre, Presupuesto, Icono
      ranges: ['Transacciones!A2:G', 'Categorias!A2:C'],
    });

    const valueRanges = response.data.valueRanges;
    if (!valueRanges) {
      return NextResponse.json({ error: 'No se encontraron datos en la hoja de cálculo.' }, { status: 404 });
    }

    const dummyCollectionRef = collection(firebase.db, '_dummy');

    // Parse Transactions from the sheet
    const transactionRows = valueRanges.find(range => range.range?.startsWith('Transacciones'))?.values || [];
    const newTransactions = transactionRows.map((row: any[]): Transaction => {
        const amountARS = parseFloat(String(row[4] || '0').replace(/[^0-9.-]+/g,"")) || 0;
        const exchangeRate = parseFloat(String(row[5] || '1').replace(/[^0-9.-]+/g,"")) || 1;
        
        return {
            id: doc(dummyCollectionRef).id, // Generate a new unique ID
            type: (String(row[6] || 'expense').toLowerCase()) as 'income' | 'expense',
            date: new Date(row[0] || Date.now()),
            description: row[1] || 'Sin descripción',
            category: row[2] || 'Sin categoría',
            user: row[3] || 'N/A',
            amountARS: amountARS,
            exchangeRate: exchangeRate,
            paymentMethod: 'Sheet Import',
        }
    }).filter(t => t.description); // Filter out empty rows

    // Parse Categories from the sheet
    const categoryRows = valueRanges.find(range => range.range?.startsWith('Categorias'))?.values || [];
    const newCategories = categoryRows.map((row: any[]): Category => ({
        name: row[0] || '',
        budget: parseFloat(String(row[1] || '0').replace(/[^0-9.-]+/g,"")) || 0,
        icon: row[2] || 'Tag',
        progress: 0,
        dependencies: [],
        startDate: null,
        endDate: null,
    })).filter(c => c.name); // Filter out empty rows

    // Update the project document in Firestore.
    // This replaces existing transactions and categories with the ones from the sheet.
    await updateDoc(projectRef, {
      transactions: newTransactions.map(t => ({...t, date: Timestamp.fromDate(t.date)})),
      categories: newCategories,
    });

    return NextResponse.json({ 
        message: 'Sincronización completada.',
        transactionsImported: newTransactions.length,
        categoriesImported: newCategories.length
    });

  } catch (error: any) {
    console.error('Error during Google Sheet sync:', error);
    return NextResponse.json({ error: error.message || 'Error al sincronizar con Google Sheets.' }, { status: 500 });
  }
}
