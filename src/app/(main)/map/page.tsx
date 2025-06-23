import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { MapPin } from "lucide-react";

const projects = [
  { name: "Greenwood Residences", top: "25%", left: "30%" },
  { name: "Pinnacle Towers", top: "40%", left: "55%" },
  { name: "Riverside Complex", top: "60%", left: "20%" },
  { name: "Oceanview Villas", top: "75%", left: "70%" },
];

export default function MapPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Projects Map</CardTitle>
        <CardDescription>Geolocations of all ongoing and completed projects.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border">
          <Image
            src="https://placehold.co/1200x800"
            alt="Map of projects"
            layout="fill"
            objectFit="cover"
            data-ai-hint="world map"
          />
          <div className="absolute inset-0 bg-black/10"></div>
          {projects.map((project) => (
            <div
              key={project.name}
              className="group absolute"
              style={{ top: project.top, left: project.left }}
            >
              <MapPin className="h-8 w-8 -translate-x-1/2 -translate-y-full transform cursor-pointer text-accent transition-transform group-hover:scale-125" />
              <div className="pointer-events-none absolute left-1/2 top-[-40px] -translate-x-1/2 whitespace-nowrap rounded-md bg-background px-2 py-1 text-sm font-medium text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {project.name}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
