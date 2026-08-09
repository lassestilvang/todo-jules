import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground text-center">
      <FileQuestion className="h-16 w-16 opacity-20 mb-6 text-foreground" aria-hidden="true" />
      <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
      <p className="text-sm mb-6 max-w-md">
        We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      <Button asChild variant="default">
        <Link href="/">
          Return Home
        </Link>
      </Button>
    </div>
  );
}
