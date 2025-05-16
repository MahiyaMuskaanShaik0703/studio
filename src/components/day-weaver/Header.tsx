import { Sunrise } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full max-w-3xl flex items-center justify-center py-6">
      <div className="flex items-center space-x-3">
        <Sunrise className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Day Weaver
        </h1>
      </div>
    </header>
  );
}
