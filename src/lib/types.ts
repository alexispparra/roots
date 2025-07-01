
import { z } from 'zod';

// --- Base Type Definitions (Using standard JS Date) ---
export type UserRole = 'admin' | 'editor' | 'viewer';

export type Participant = {
  email: string;
  name: string;
  role: UserRole;
};

export type Category = {
  name: string;
  budget: number;
  icon?: string | null;
  progress?: number | null; // From 0 to 100
  startDate?: Date | null;
  endDate?: Date | null;
  dependencies?: string[];
};

export type Event = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
};

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  date: Date;
  description: string;
  amountARS: number;
  amountUSD: number;
  exchangeRate: number;
  attachmentDataUrl?: string;
  // Expense-specific fields
  category?: string;
  user?: string;
  paymentMethod?: string;
};

export type Project = {
  id: string;
  name:string;
  description?: string;
  address: string;
  ownerEmail: string;
  participants: Participant[];
  participantsEmails: string[];
  categories: Category[];
  transactions: Transaction[];
  events: Event[];
  status: ProjectStatus;
  createdAt: Date;
};


// --- Zod Schemas & Input/Form Types (Single Source of Truth) ---

export const AddProjectFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold']),
});
export type AddProjectData = z.infer<typeof AddProjectFormSchema>;


export const UpdateProjectFormSchema = AddProjectFormSchema;
export type UpdateProjectData = z.infer<typeof UpdateProjectFormSchema>;

// --- Expense Schemas ---
const BaseExpenseFormSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida." }),
  description: z.string().min(1, "La descripción es requerida."),
  category: z.string().min(1, "La categoría es requerida."),
  user: z.string().min(1, "El usuario es requerido."),
  paymentMethod: z.string().min(1, "El medio de pago es requerido."),
  amountARS: z.coerce.number().min(0, "El monto no puede ser negativo."),
  exchangeRate: z.coerce.number().min(0, "El cambio no puede ser negativo.").optional(),
  amountUSD: z.coerce.number().min(0, "El monto no puede ser negativo."),
  attachmentDataUrl: z.string().optional(),
});
const expenseRefinement = (data: { amountARS: number, amountUSD: number }) => data.amountARS > 0 || data.amountUSD > 0;
const expenseRefinementMessage = {
  message: "Debes ingresar un monto en AR$ o U$S.",
  path: ["amountARS"],
};

export const AddExpenseFormSchema = BaseExpenseFormSchema.refine(expenseRefinement, expenseRefinementMessage);
export type AddExpenseInput = z.infer<typeof AddExpenseFormSchema>;

export const UpdateExpenseFormSchema = BaseExpenseFormSchema.extend({ id: z.string() }).refine(expenseRefinement, expenseRefinementMessage);
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseFormSchema>;


// --- Income Schemas ---
const BaseIncomeFormSchema = z.object({
  date: z.date({ required_error: "La fecha es requerida." }),
  description: z.string().min(1, "La descripción es requerida."),
  amountARS: z.coerce.number().min(0, "El monto no puede ser negativo."),
  exchangeRate: z.coerce.number().min(0, "El cambio no puede ser negativo.").optional(),
  amountUSD: z.coerce.number().min(0, "El monto no puede ser negativo."),
});
const incomeRefinement = (data: { amountARS: number, amountUSD: number }) => data.amountARS > 0 || data.amountUSD > 0;
const incomeRefinementMessage = {
  message: "Debes ingresar un monto en AR$ o U$S.",
  path: ["amountARS"],
};

export const AddIncomeFormSchema = BaseIncomeFormSchema.refine(incomeRefinement, incomeRefinementMessage);
export type AddIncomeInput = z.infer<typeof AddIncomeFormSchema>;

export const UpdateIncomeFormSchema = BaseIncomeFormSchema.extend({ id: z.string() }).refine(incomeRefinement, incomeRefinementMessage);
export type UpdateIncomeInput = z.infer<typeof UpdateIncomeFormSchema>;


// --- Category Schemas ---
const BaseCategoryFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  budget: z.coerce.number().min(0, "El presupuesto debe ser un número positivo."),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});
const categoryDateRefinement = (data: { startDate?: Date | null, endDate?: Date | null }) => {
    if (data.startDate && data.endDate) return data.endDate >= data.startDate
    return true
};
const categoryDateRefinementMessage = { message: "La fecha de fin no puede ser anterior a la de inicio.", path: ["endDate"] };

export const AddCategoryFormSchema = BaseCategoryFormSchema.refine(categoryDateRefinement, categoryDateRefinementMessage);
export type AddCategoryInput = z.infer<typeof AddCategoryFormSchema>;

const UpdateCategoryBaseSchema = BaseCategoryFormSchema.extend({
    icon: z.string().optional().nullable(),
    progress: z.coerce.number().min(0).max(100).optional().nullable(),
    dependencies: z.array(z.string()).optional(),
});
export const UpdateCategoryFormSchema = UpdateCategoryBaseSchema.refine(categoryDateRefinement, categoryDateRefinementMessage);
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryFormSchema>;


// --- Event Schemas ---
export const AddEventFormSchema = z.object({
  title: z.string().min(1, "El título es requerido."),
  date: z.date({ required_error: "La fecha es requerida." }),
});
export type AddEventInput = z.infer<typeof AddEventFormSchema>;


export const UpdateEventFormSchema = AddEventFormSchema.extend({
    completed: z.boolean().optional(),
});
export type UpdateEventInput = z.infer<typeof UpdateEventFormSchema>;

// --- Supplier Schemas ---
export const SupplierFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  rubro: z.string().min(1, "El rubro es requerido."),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Correo electrónico inválido.").optional().or(z.literal('')),
  address: z.string().optional(),
  cuit: z.string().optional(),
});
export type SupplierFormData = z.infer<typeof SupplierFormSchema>;

export type Supplier = SupplierFormData & {
  id: string;
  ownerId: string;
  createdAt: Date;
};
