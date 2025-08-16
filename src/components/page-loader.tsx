// src/components/page-loader.tsx
import { Loader2 } from "lucide-react";

export function PageLoader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-yellow-200 via-pink-200 to-pink-300 animate-in fade-in-25">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-pink-600" />
        <p className="text-lg font-medium text-pink-800">Loading...</p>
      </div>
    </div>
  );
}
