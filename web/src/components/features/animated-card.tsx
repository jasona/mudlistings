import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'lift' | 'border';
  glowColor?: string;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', glowColor, children, ...props }, ref) => {
    const variants = {
      default: 'transition-all duration-200 hover:bg-card/80',
      glow: cn(
        'transition-all duration-300',
        'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]',
        glowColor && `hover:shadow-[0_0_30px_${glowColor}]`
      ),
      lift: 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
      border: 'transition-all duration-200 hover:border-primary/50',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-card p-6',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
        className
      )}
    >
      {children}
    </div>
  );
}

// Staggered animation for lists
interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 50,
  className,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-in fade-in-0 slide-in-from-bottom-2"
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'backwards',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Fade in on scroll (intersection observer wrapper)
interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
}

export function FadeInOnScroll({
  children,
  className,
  threshold = 0.1,
}: FadeInOnScrollProps) {
  return (
    <div
      className={cn(
        'opacity-0 translate-y-4 transition-all duration-700',
        '[&.visible]:opacity-100 [&.visible]:translate-y-0',
        className
      )}
      ref={(el) => {
        if (!el) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              el.classList.add('visible');
              observer.unobserve(el);
            }
          },
          { threshold }
        );

        observer.observe(el);
      }}
    >
      {children}
    </div>
  );
}

// Skeleton pulse animation
interface SkeletonPulseProps {
  className?: string;
}

export function SkeletonPulse({ className }: SkeletonPulseProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

// Loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  );
}
