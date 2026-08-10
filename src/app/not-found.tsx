import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex justify-center mb-6 text-muted-foreground">
        <FileQuestion className="h-20 w-20 opacity-20" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" aria-hidden="true" />
          Return to Inbox
        </Link>
      </Button>
    </div>
  );
}
