"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectsList } from "@/components/projects-list";


export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Panel Global</CardTitle>
          <CardDescription>Un resumen de todos tus emprendimientos.</CardDescription>
        </CardHeader>
      </Card>
      
      <ProjectsList />
    </div>
  );
}
