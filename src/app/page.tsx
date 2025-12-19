
'use client';

import { useUser, useAuth, initiateAnonymousSignIn } from '@/firebase';
import { Dashboard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignIn = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  useEffect(() => {
    // Prefetch dashboard assets when on the login page
    if (!user) {
        // You can prefetch necessary assets here if needed
    }
  }, [user]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-heading text-5xl text-primary">Welcome to the Skill Garden</h1>
          <p className="mt-4 text-lg text-muted-foreground">Please sign in to continue</p>
          <Button onClick={handleSignIn} className="mt-8" size="lg">
            Sign In Anonymously
          </Button>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} />;
}
