export function AIInterviewer({
  text,
  speaking,
}: {
  text: string;
  speaking: boolean;
}) {
  return (
    <div className="relative bg-black aspect-video rounded-lg overflow-hidden flex flex-col items-center justify-center">
      {/* AI Avatar */}
      <div
        className={`w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 
        flex items-center justify-center text-white text-3xl font-bold transition-all
        ${speaking ? "animate-pulse scale-105" : ""}`}
      >
        AI
      </div>

      {/* Question */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black p-4">
        <p className="text-white text-center text-lg font-semibold">
          {text}
        </p>
      </div>
    </div>
  );
}