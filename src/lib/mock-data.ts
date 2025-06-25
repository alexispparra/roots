
import { Timestamp } from 'firebase/firestore';
import type { Project, Participant, UserRole, Category, Transaction, ProjectStatus, Event } from '@/contexts/ProjectsContext';
import type { User } from 'firebase/auth';

// --- CONFIGURATION ---
// Set this to false to switch back to live Firebase data.
export const USE_MOCK_DATA = false;

// --- MOCK USER ---
export const mockUser: User = {
    uid: 'mock-user-123',
    email: 'testing@roots.app',
    displayName: 'Usuario de Prueba',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    providerId: 'password',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({
        token: 'mock-token',
        expirationTime: '',
        authTime: '',
        issuedAtTime: '',
        signInProvider: null,
        signInSecondFactor: null,
        claims: {},
    }),
    reload: async () => {},
    toJSON: () => ({}),
};


// --- MOCK DATA DEFINITIONS ---

const participants: Participant[] = [
    { email: 'testing@roots.app', name: 'Usuario de Prueba', role: 'admin' },
    { email: 'viewer@roots.app', name: 'Usuario Lector', role: 'viewer' },
];

const categoriesProject1: Category[] = [
    { name: 'Marketing Digital', budget: 50000, icon: 'Megaphone', progress: 75, startDate: Timestamp.fromDate(new Date('2024-07-10')), endDate: Timestamp.fromDate(new Date('2024-08-10')), dependencies: [] },
    { name: 'Diseño Gráfico', budget: 35000, icon: 'PenTool', progress: 50, startDate: Timestamp.fromDate(new Date('2024-07-15')), endDate: Timestamp.fromDate(new Date('2024-08-15')), dependencies: ['Marketing Digital'] },
    { name: 'Infraestructura', budget: 120000, icon: 'Building', progress: 20, startDate: Timestamp.fromDate(new Date('2024-08-01')), endDate: Timestamp.fromDate(new Date('2024-09-30')), dependencies: [] },
];

const categoriesProject2: Category[] = [
    { name: 'Materia Prima', budget: 250000, icon: 'Layers', progress: 100, startDate: Timestamp.fromDate(new Date('2024-06-01')), endDate: Timestamp.fromDate(new Date('2024-06-30')), dependencies: [] },
    { name: 'Logística', budget: 80000, icon: 'Shovel', progress: 10, startDate: Timestamp.fromDate(new Date('2024-07-01')), endDate: Timestamp.fromDate(new Date('2024-07-15')), dependencies: ['Materia Prima'] },
];

const transactionsProject1: Transaction[] = [
    { id: 't1-1', type: 'income', date: Timestamp.fromDate(new Date('2024-07-20')), description: 'Aporte inicial', amountARS: 500000, exchangeRate: 1050 },
    { id: 't1-2', type: 'expense', date: Timestamp.fromDate(new Date('2024-07-22')), description: 'Campaña en Redes Sociales', amountARS: 25000, exchangeRate: 1055, category: 'Marketing Digital', user: 'Usuario de Prueba', paymentMethod: 'Banco', attachmentDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    { id: 't1-3', type: 'expense', date: Timestamp.fromDate(new Date('2024-07-25')), description: 'Hosting y Dominio', amountARS: 45000, exchangeRate: 1060, category: 'Infraestructura', user: 'Usuario de Prueba', paymentMethod: 'Tarjeta' },
];

const transactionsProject2: Transaction[] = [
    { id: 't2-1', type: 'income', date: Timestamp.fromDate(new Date('2024-06-15')), description: 'Venta Mayorista', amountARS: 150000, exchangeRate: 1020 },
    { id: 't2-2', type: 'expense', date: Timestamp.fromDate(new Date('2024-06-18')), description: 'Compra de telas', amountARS: 95000, exchangeRate: 1025, category: 'Materia Prima', user: 'Usuario de Prueba', paymentMethod: 'Efectivo' },
];

const eventsProject1: Event[] = [
    { id: 'evt-1', title: 'Reunión de kickoff', date: Timestamp.fromDate(new Date('2024-07-29')), completed: true },
    { id: 'evt-2', title: 'Llamar a agencia de marketing', date: Timestamp.fromDate(new Date('2024-08-05')), completed: false },
    { id: 'evt-3', title: 'Revisión de entregable de diseño', date: Timestamp.fromDate(new Date('2024-08-05')), completed: false },
]

export const mockProjects: Project[] = [
    {
        id: 'proj-1',
        name: 'Lanzamiento App Móvil',
        description: 'Proyecto para el desarrollo y lanzamiento de la nueva aplicación móvil de finanzas.',
        address: 'Av. Libertador 123, Buenos Aires',
        googleSheetId: 'test-sheet-id-1',
        ownerEmail: 'testing@roots.app',
        participants,
        categories: categoriesProject1,
        transactions: transactionsProject1,
        events: eventsProject1,
        status: 'in-progress',
        createdAt: Timestamp.fromDate(new Date('2024-07-01')),
    },
    {
        id: 'proj-2',
        name: 'Colección Invierno 2024',
        description: 'Producción y venta de la nueva colección de ropa de invierno.',
        address: 'Calle Falsa 123, Córdoba',
        googleSheetId: '',
        ownerEmail: 'testing@roots.app',
        participants,
        categories: categoriesProject2,
        transactions: transactionsProject2,
        events: [],
        status: 'planning',
        createdAt: Timestamp.fromDate(new Date('2024-06-01')),
    },
     {
        id: 'proj-3',
        name: 'Proyecto Completado',
        description: 'Un proyecto de consultoría que ya ha finalizado.',
        address: 'Plaza Moreno, La Plata',
        googleSheetId: '',
        ownerEmail: 'testing@roots.app',
        participants: [participants[0]],
        categories: [{ name: 'Consultoría', budget: 100000, icon: 'FileText', progress: 100, startDate: null, endDate: null, dependencies: [] }],
        transactions: [
             { id: 't3-1', type: 'income', date: Timestamp.fromDate(new Date('2024-01-10')), description: 'Pago Cliente', amountARS: 200000, exchangeRate: 900 },
             { id: 't3-2', type: 'expense', date: Timestamp.fromDate(new Date('2024-01-15')), description: 'Software', amountARS: 15000, exchangeRate: 900, category: 'Consultoría', user: 'Usuario de Prueba', paymentMethod: 'Tarjeta' }
        ],
        events: [],
        status: 'completed',
        createdAt: Timestamp.fromDate(new Date('2024-01-01')),
    }
];
