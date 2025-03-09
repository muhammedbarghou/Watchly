import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, Bug, ArrowRight, ChevronDown } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  title?: string;
  hideDetails?: boolean;
  className?: string;
  resetButtonText?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with the error info for displaying stack traces
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Report to error tracking service if needed
    this.reportError(error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reportError(error: Error, errorInfo: ErrorInfo): void {
    // This can be connected to an error reporting service like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { 
      children, 
      fallback, 
      title = "Something went wrong", 
      hideDetails = false,
      className = "max-w-lg mx-auto my-8",
      resetButtonText = "Try Again"
    } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorDisplay
          error={error}
          errorInfo={errorInfo}
          errorCount={errorCount}
          title={title}
          hideDetails={hideDetails}
          className={className}
          resetButtonText={resetButtonText}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

// Separate error display component allows for more complex UI handling
function ErrorDisplay({
  error,
  errorInfo,
  errorCount,
  title,
  hideDetails,
  className,
  resetButtonText,
  onReset
}: {
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
  title: string;
  hideDetails: boolean;
  className: string;
  resetButtonText: string;
  onReset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get a simplified error message if possible
  const getSimplifiedMessage = () => {
    const message = error?.message || 'An unexpected error occurred';
    
    // Try to provide more user-friendly messages for common errors
    if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    
    if (message.includes('Timeout')) {
      return 'The operation timed out. Please try again.';
    }
    
    if (message.includes('TypeError') && message.includes('undefined')) {
      return 'A data error occurred. Some information may be missing.';
    }
    
    // Keep original message if we can't simplify it
    return message;
  };

  const simplifiedMessage = getSimplifiedMessage();
  const stackTrace = error?.stack || 'No stack trace available';
  const componentStack = errorInfo?.componentStack || 'No component stack available';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">{title}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-3">
            <Alert variant="destructive" className="mb-4">
              <AlertTitle className="font-medium">Error: {simplifiedMessage}</AlertTitle>
              <AlertDescription>
                {errorCount > 1 && (
                  <div className="mt-2 text-sm text-gray-500">
                    This error has occurred {errorCount} times.
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {!hideDetails && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <span>Technical Details</span>
                  <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </Button>
                
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div className="rounded-md bg-gray-50 p-3 font-mono text-xs text-gray-800 overflow-auto max-h-60">
                      <div className="mb-2">
                        <strong className="text-gray-700">Error:</strong>
                        <pre className="whitespace-pre-wrap break-words mt-1">{stackTrace}</pre>
                      </div>
                      
                      <div className="mt-4">
                        <strong className="text-gray-700">Component Stack:</strong>
                        <pre className="whitespace-pre-wrap break-words mt-1">{componentStack}</pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 border-t border-gray-100">
            <Button 
              onClick={onReset}
              className="w-full sm:w-auto flex items-center justify-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {resetButtonText}
            </Button>
            
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center"
              onClick={() => window.location.reload()}
            >
              Reload Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        {/* Helpful tips for recovery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-sm text-gray-600 flex items-start space-x-2"
        >
          <Bug className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            If this problem persists, try clearing your browser cache or contact support.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ErrorBoundary;