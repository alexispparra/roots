import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const transactions = [
  { id: 'TRN-001', date: '2024-07-24', description: 'Supermercado', category: 'Comida', account: 'Corriente', type: 'expense', amount: 75.60 },
  { id: 'TRN-002', date: '2024-07-23', description: 'Salario', category: 'Ingresos', account: 'Corriente', type: 'income', amount: 2500.00 },
  { id: 'TRN-003', date: '2024-07-22', description: 'Gasolina', category: 'Transporte', account: 'Tarjeta de Crédito', type: 'expense', amount: 45.30 },
  { id: 'TRN-004', date: '2024-07-21', description: 'Entradas de cine', category: 'Entretenimiento', account: 'Tarjeta de Crédito', type: 'expense', amount: 30.00 },
  { id: 'TRN-005', date: '2024-07-20', description: 'Compra online', category: 'Compras', account: 'Corriente', type: 'expense', amount: 120.00 },
  { id: 'TRN-006', date: '2024-07-19', description: 'Pago freelance', category: 'Ingresos', account: 'Ahorros', type: 'income', amount: 500.00 },
  { id: 'TRN-007', date: '2024-07-18', description: 'Cena con amigos', category: 'Comida', account: 'Tarjeta de Crédito', type: 'expense', amount: 95.00 },
  { id: 'TRN-008', date: '2024-07-17', description: 'Membresía del gimnasio', category: 'Salud', account: 'Corriente', type: 'expense', amount: 50.00 },
];

export default function TransactionsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="font-headline">Transacciones</CardTitle>
          <CardDescription>
            Un historial completo de tus ingresos y gastos.
          </CardDescription>
        </div>
        <Button size="sm" className="ml-auto gap-1">
          <PlusCircle className="h-4 w-4" />
          Añadir Transacción
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</TableCell>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                </TableCell>
                <TableCell>{transaction.account}</TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
