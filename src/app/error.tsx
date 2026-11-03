"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="space-y-6">
        <p className="mono-label text-champagne">Error</p>
        <h1 className="display-m">Something went wrong.</h1>
        <button className="btn btn-solid" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
