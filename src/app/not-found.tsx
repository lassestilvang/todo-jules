import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground w-full max-w-md">
        <FileQuestion className="h-16 w-16 opacity-20 mb-6" aria-hidden="true" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We couldn&apos;t find the page you were looking for. It might have been removed, or the link may be broken.
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            Return to Inbox
          </Link>
        </Button>
      </div>
    </div>
  );
}
