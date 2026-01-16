import { useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Server,
  Code,
  CheckCircle,
  Loader2,
  Copy,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PageTransition } from '@/components/features/animated-card';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMud } from '@/hooks/use-muds';
import { useInitiateClaim, useVerifyClaim } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ClaimMethod = 'mssp' | 'metatag';
type ClaimStep = 'select' | 'verify' | 'success';

export default function ClaimMudPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const { data: mud, isLoading: isMudLoading } = useMud(slug || '');

  const [step, setStep] = useState<ClaimStep>('select');
  const [method, setMethod] = useState<ClaimMethod>('mssp');
  const [verificationCode, setVerificationCode] = useState('');

  const initiateClaim = useInitiateClaim();
  const verifyClaim = useVerifyClaim();

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to={`/login?redirect=/claim/${slug}`} replace />;
  }

  const handleInitiateClaim = () => {
    if (!mud) return;

    initiateClaim.mutate(
      { mudId: mud.id, method },
      {
        onSuccess: (data) => {
          setVerificationCode(data.verificationCode);
          setStep('verify');
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to initiate claim');
        },
      }
    );
  };

  const handleVerifyClaim = () => {
    if (!mud) return;

    verifyClaim.mutate(mud.id, {
      onSuccess: (data) => {
        if (data.success) {
          setStep('success');
          toast.success('Claim verified successfully!');
        } else {
          toast.error(data.message || 'Verification failed');
        }
      },
      onError: (error) => {
        toast.error((error as Error).message || 'Failed to verify claim');
      },
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (isUserLoading || isMudLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64" />
        </div>
      </PageTransition>
    );
  }

  if (!mud) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">MUD Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The MUD you're trying to claim doesn't exist.
          </p>
          <Button className="mt-6" onClick={() => navigate('/browse')}>
            Browse MUDs
          </Button>
        </div>
      </PageTransition>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Claim Successful!</CardTitle>
              <CardDescription>
                You are now the administrator of <span className="font-semibold">{mud.name}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-left">
                <p className="font-medium mb-2">What you can do now:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Edit your MUD's listing information</li>
                  <li>• View analytics and visitor statistics</li>
                  <li>• Respond to reviews from players</li>
                  <li>• Invite other administrators</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => navigate('/admin')}>
                Go to Admin Dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/admin/mud/${mud.id}/edit`)}
              >
                Edit MUD Listing
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/mud/${mud.slug}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to MUD
          </Button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Claim Ownership</h1>
              <p className="text-muted-foreground">
                Verify you're the administrator of <span className="font-semibold">{mud.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Select Method */}
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Verification Method</CardTitle>
              <CardDescription>
                Select how you'd like to prove ownership of this MUD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={method}
                onValueChange={(value: string) => setMethod(value as ClaimMethod)}
                className="space-y-4"
              >
                <div
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    method === 'mssp'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                  onClick={() => setMethod('mssp')}
                >
                  <RadioGroupItem value="mssp" id="mssp" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="mssp" className="flex items-center gap-2 cursor-pointer">
                      <Server className="h-4 w-4" />
                      MSSP Verification
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a verification code to your MUD's MSSP (Mud Server Status Protocol) response.
                      This is the quickest and most common method.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
                    method === 'metatag'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                  onClick={() => setMethod('metatag')}
                >
                  <RadioGroupItem value="metatag" id="metatag" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="metatag" className="flex items-center gap-2 cursor-pointer">
                      <Code className="h-4 w-4" />
                      Website Meta Tag
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a meta tag to your MUD's website. Requires your MUD to have a website
                      linked to this listing.
                    </p>
                    {!mud.websiteUrl && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-amber-500">
                        <AlertCircle className="h-3 w-3" />
                        <span>This MUD doesn't have a website linked</span>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleInitiateClaim}
                disabled={initiateClaim.isPending || (method === 'metatag' && !mud.websiteUrl)}
                className="w-full"
              >
                {initiateClaim.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating verification code...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {method === 'mssp' ? (
                    <Server className="h-5 w-5" />
                  ) : (
                    <Code className="h-5 w-5" />
                  )}
                  {method === 'mssp' ? 'MSSP Verification' : 'Meta Tag Verification'}
                </CardTitle>
                <CardDescription>
                  Follow these instructions to verify ownership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <Label className="text-xs text-muted-foreground">Your Verification Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 font-mono text-lg text-foreground">
                      {verificationCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(verificationCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {method === 'mssp' ? (
                      <>
                        <p>1. Add the following to your MUD's MSSP response:</p>
                        <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                          MUDLISTINGS_VERIFY: {verificationCode}
                        </div>
                        <p>2. Make sure your MUD is running and MSSP is enabled</p>
                        <p>3. Click "Verify" below to check the verification</p>
                      </>
                    ) : (
                      <>
                        <p>1. Add the following meta tag to your website's &lt;head&gt;:</p>
                        <div className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto">
                          {`<meta name="mudlistings-verify" content="${verificationCode}" />`}
                        </div>
                        <p>2. Make sure the page is publicly accessible</p>
                        <p>3. Click "Verify" below to check the verification</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Note</p>
                    <p className="text-muted-foreground">
                      This verification code expires in 24 hours. You can remove it after verification is complete.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('select');
                    setVerificationCode('');
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyClaim}
                  disabled={verifyClaim.isPending}
                  className="flex-1"
                >
                  {verifyClaim.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Ownership'
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Help Link */}
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">Need help?</p>
                    <p className="text-xs text-muted-foreground">
                      Check our documentation for detailed setup guides
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/help/claim-verification">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Help Guide
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
