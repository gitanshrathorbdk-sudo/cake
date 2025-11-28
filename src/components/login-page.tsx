'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from './logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

const VALID_PINS = ['2007', '7777', '2008'];

export function LoginPage() {
  const [pin, setPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();
  const auth = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    if (VALID_PINS.includes(pin)) {
      try {
        await signInAnonymously(auth);
        toast({
          title: 'Login Successful',
          description: 'Welcome to Harmonica!',
        });
        // The onAuthStateChanged listener in page.tsx will handle the redirect.
      } catch (e: any) {
        console.error("Anonymous sign-in failed", e);
        setError('Could not connect to the authentication service. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: e.message || 'An unknown error occurred.',
        });
      }
    } else {
      setError('The PIN you entered is incorrect.');
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'The PIN you entered is incorrect.',
      });
    }
    
    setIsLoading(false);
    if (!VALID_PINS.includes(pin)) {
        setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <div className="flex h-svh w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Welcome to Harmonica</CardTitle>
          <CardDescription>Enter your PIN to access the music library.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN Code</Label>
            <Input
              id="pin"
              type="password"
              placeholder="****"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
             {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Enter'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
