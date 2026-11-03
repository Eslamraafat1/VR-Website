"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// The 360° viewer (three.js + Photo Sphere Viewer) is browser-only and kept out of the initial bundle.
const ExperienceApp = dynamic(() => import("./experience-app"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 grid place-items-center bg-[#05060a]"><span className="mono-label !text-white/70">VISTRA® …</span></div>,
});

export default function ExperienceLoader() {
  return (
    <Suspense fallback={null}>
      <ExperienceApp />
    </Suspense>
  );
}
