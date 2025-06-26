
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

    const auth = new google.auth.JWT(clientEmail, undefined, privateKey, ['https://www.googleapis.com/auth/spreadsheets.readonly']);
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: sheetId,
      ranges: ['Transacciones!A2:G', 'Categorias!A2:C'],
    });

    const valueRanges = response.data.valueRanges;
    if (!valueRanges) {
      return NextResponse.json({ error: 'No se encontraron datos en la hoja de cálculo.' }, { status: 404 });
    }

    const dummyCollectionRef = collection(firebase.db, '_dummy');

    const transactionRows = valueRanges.find(range => range.range?.startsWith('Transacciones'))?.values || [];
    const newTransactions = transactionRows.map((row: any[]): Transaction | null => {
        if (!row[0] || !row[1]) return null; 

        const amountARS = parseFloat(String(row[4] || '0').replace(/[^0-9.-]+/g,"")) || 0;
        const exchangeRate = parseFloat(String(row[5] || '1').replace(/[^0-9.-]+/g,"")) || 1;
        
        return {
            id: doc(dummyCollectionRef).id,
            type: (String(row[6] || 'expense').toLowerCase()) as 'income' | 'expense',
            date: new Date(row[0]),
            description: row[1] || 'Sin descripción',
            category: row[2] || 'Sin categoría',
            user: row[3] || 'N/A',
            amountARS: amountARS,
            exchangeRate: exchangeRate,
            paymentMethod: 'Sheet Import',
        }
    }).filter((t): t is Transaction => t !== null && t.description !== 'Sin descripción');

    const categoryRows = valueRanges.find(range => range.range?.startsWith('Categorias'))?.values || [];
    const newCategories = categoryRows.map((row: any[]): Category => ({
        name: row[0] || '',
        budget: parseFloat(String(row[1] || '0').replace(/[^0-9.-]+/g,"")) || 0,
        icon: row[2] || 'Tag',
        progress: 0,
        dependencies: [],
        startDate: null,
        endDate: null,
    })).filter(c => c.name);

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
