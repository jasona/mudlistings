import { PageTransition } from '@/components/features/animated-card';

export default function FaqPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
        <p className="mt-4 text-muted-foreground">
          Full implementation coming in Section 12.0
        </p>
      </div>
    </PageTransition>
  );
}
