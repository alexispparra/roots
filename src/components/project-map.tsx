// This component is temporarily disabled to resolve a critical rendering issue.
// It will be re-enabled once the root cause is fixed.
export function ProjectMap({ address }: { address: string }) {
  return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
          <p className="text-muted-foreground">La función de mapa está temporalmente desactivada.</p>
      </div>
  );
}
