import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading salon...</p>
      </div>
    </div>
  );
};

export default Loading;
