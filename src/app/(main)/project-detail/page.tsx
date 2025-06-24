
import { Suspense } from 'react';
import ProjectDetailClient from '@/components/project-detail-client';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

function ProjectDetailFallback() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Cargando Proyecto...</CardTitle>
                <CardDescription>Por favor, espera un momento.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    )
}

export default function ProjectDetailPage() {
    return (
        <Suspense fallback={<ProjectDetailFallback />}>
            <ProjectDetailClient />
        </Suspense>
    )
}
