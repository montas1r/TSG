
'use client';

import React from 'react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Detect infinite loop specifically
    if (error.message.includes('Maximum call stack')) {
      console.error('🔴 INFINITE LOOP DETECTED - Check console for render logs');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center border">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              ⚠️ Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message.includes('Maximum call stack')
                ? 'A critical error occurred, likely an infinite loop. The app needs to reload to recover.'
                : 'An unexpected error occurred.'}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
