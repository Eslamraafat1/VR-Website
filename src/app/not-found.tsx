import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="space-y-6">
        <p className="mono-label text-champagne">404</p>
        <h1 className="display-m">This space doesn&apos;t exist.</h1>
        <Link href="/" className="btn btn-solid">Back to home</Link>
      </div>
    </main>
  );
}
