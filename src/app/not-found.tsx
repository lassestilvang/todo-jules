import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-12 text-center">
      <div className="flex justify-center mb-6 text-muted-foreground">
        <FileQuestion className="h-24 w-24 opacity-20" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
      </p>
      <Button asChild>
        <Link href="/">
          Return Home
        </Link>
      </Button>
    </div>
  )
}
