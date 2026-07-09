import { Suspense } from "react";
import RetreatsContent from "./retreats-content";

export default function RetreatsPage() {
  return (
    <Suspense fallback={null}>
      <RetreatsContent />
    </Suspense>
  );
}
