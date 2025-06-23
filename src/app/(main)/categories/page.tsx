import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Heart,
  Gift,
  Film,
  GraduationCap,
  Briefcase,
  PlusCircle,
} from "lucide-react";

const categories = [
  { name: "Comida y Bebida", icon: <Utensils /> },
  { name: "Transporte", icon: <Car /> },
  { name: "Compras", icon: <ShoppingBag /> },
  { name: "Vivienda", icon: <Home /> },
  { name: "Salud", icon: <Heart /> },
  { name: "Regalos", icon: <Gift /> },
  { name: "Entretenimiento", icon: <Film /> },
  { name: "Educación", icon: <GraduationCap /> },
  { name: "Trabajo", icon: <Briefcase /> },
];

export default function CategoriesPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Categorías</CardTitle>
          <CardDescription>Organiza tus transacciones asignándolas a diferentes categorías.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => (
          <Card key={category.name} className="flex flex-col items-center justify-center p-6 text-center transition-transform hover:scale-105 hover:shadow-lg">
            <div className="mb-4 text-primary [&>svg]:h-10 [&>svg]:w-10">
              {category.icon}
            </div>
            <p className="font-semibold">{category.name}</p>
          </Card>
        ))}
        <Card className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed bg-transparent p-6 text-center text-muted-foreground transition-colors hover:border-primary hover:bg-muted hover:text-primary">
          <div className="mb-4 [&>svg]:h-10 [&>svg]:w-10">
            <PlusCircle />
          </div>
          <p className="font-semibold">Añadir Nueva</p>
        </Card>
      </div>
    </div>
  );
}
