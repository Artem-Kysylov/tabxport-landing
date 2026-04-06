import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center pt-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mb-3 text-3xl font-semibold text-secondary sm:text-4xl">
          Payment successful
        </h1>

        <p className="mb-8 max-w-xl text-base text-secondary/70 sm:text-lg">
          Your TableXport Pro access is being finalized. You can return to the app now and your unlocked features should be ready.
        </p>

        <Button asChild className="min-w-[260px]">
          <Link href="/">Go to TableXport</Link>
        </Button>
      </div>
    </main>
  );
}
