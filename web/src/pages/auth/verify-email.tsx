import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageTransition } from '@/components/features/animated-card';
import { useVerifyEmail } from '@/hooks/use-auth';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (token && status === 'loading') {
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          setStatus('success');
        },
        onError: (error) => {
          setStatus('error');
          setErrorMessage((error as Error).message || 'Failed to verify email');
        },
      });
    }
  }, [token]);

  // No token provided
  if (status === 'no-token') {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Mail className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl">Verification link missing</CardTitle>
              <CardDescription>
                No verification token was found. Please use the link from your verification email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                If you haven't received a verification email, you can request a new one from your profile settings.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/">Go to homepage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Loading state
  if (status === 'loading') {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Email verified!</CardTitle>
              <CardDescription>
                Your email address has been successfully verified. You now have full access to all MudListings features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">What you can do now:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Write reviews for MUDs you've played</li>
                  <li>• Save favorites and track activity</li>
                  <li>• Claim and manage your own MUD listings</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/browse">Explore MUDs</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/profile">Go to profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Error state
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Verification failed</CardTitle>
            <CardDescription>
              {errorMessage || 'We couldn\'t verify your email address.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              This could happen if the link has expired or has already been used.
              Verification links are valid for 24 hours.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link to="/login">Sign in to request a new link</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/">Go to homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
