import { Suspense } from "react";
import BlogsContent from "./blogs-content";

export default function BlogsPage() {
  return (
    <Suspense fallback={null}>
      <BlogsContent />
    </Suspense>
  );
}
