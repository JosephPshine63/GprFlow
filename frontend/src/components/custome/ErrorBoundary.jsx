/* eslint-disable react/prop-types */
import { Component } from "react";
import BrandMark from "./BrandMark";

// Last-resort screen for render errors. Plain <a> on purpose: the router or
// store may be what broke, so a full reload is the safe way out.
class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
        <BrandMark className="h-10" />
        <h1 className="mt-8 font-heading text-3xl font-bold">Qualcosa è andato storto</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Si è verificato un errore imprevisto. Ricarica la pagina per riprovare.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-brand h-11 px-6">
            Ricarica
          </button>
          <a href="/" className="inline-flex h-11 items-center rounded-xl border px-6 text-sm font-semibold hover:bg-accent">
            Torna alla Home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
