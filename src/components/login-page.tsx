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

// --- IMPORTANT ---
// These are the valid PINs. You can change or add more here.
const VALID_PINS = ['2007', '7777', '2008']; 
// 4 hours in milliseconds
const SESSION_DURATION = 4 * 60 * 60 * 1000; 

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [pin, setPin] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleLogin = () => {
    setIsLoading(true);

    setTimeout(() => {
        if (VALID_PINS.includes(pin)) {
            const session = {
                startTime: new Date().getTime(),
            };
            localStorage.setItem('harmonica_session', JSON.stringify(session));
            toast({
                title: 'Login Successful',
                description: 'Welcome to Harmonica!',
            });
            onLoginSuccess();
        } else {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'The PIN you entered is incorrect.',
            });
        }
        setIsLoading(false);
        setPin('');
    }, 500); // Simulate network delay
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
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Enter'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
