// @ts-nocheck — class component; checkJs cannot resolve React.Component base members in .jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  /** @param {Error} error */
  static getDerivedStateFromError(error) {
    return { error };
  }

  /** @param {Error} error @param {React.ErrorInfo} info */
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry() {
    this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="card"
          style={{ margin: '40px auto', maxWidth: 480, textAlign: 'center', padding: 32 }}
          role="alert"
        >
          <div className="card-title" style={{ marginBottom: 12, color: 'var(--red)' }}>
            Something went wrong
          </div>
          <div className="card-label" style={{ marginBottom: 16 }}>
            {this.state.error.message}
          </div>
          <button className="tab-btn" onClick={() => this.handleRetry()} style={{ padding: '6px 16px' }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
