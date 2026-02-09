import { Component, ReactNode } from 'react';
import RuntimeErrorFallback from './RuntimeErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class RuntimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Runtime error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    console.error('Stack trace:', error.stack);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <RuntimeErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
