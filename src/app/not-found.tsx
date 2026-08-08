import React from 'react';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-12 text-center">
      <div className="bg-muted p-4 rounded-full mb-6">
        <CircleAlert className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn&apos;t find the page you were looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <Button asChild>
        <Link href="/">
          Return Home
        </Link>
      </Button>
    </div>
  );
}
