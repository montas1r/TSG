'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, auth, loading } = useAuth();

  const handleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="font-headline text-5xl tracking-tight">The Skill Garden</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Sign in to start nurturing your skills.
        </p>
        <Button
          onClick={handleSignIn}
          className="mt-8 w-full max-w-xs"
          size="lg"
          disabled={!auth}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
