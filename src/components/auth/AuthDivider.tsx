export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-netflix-gray"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-netflix-gray text-gray-400">
          {text}
        </span>
      </div>
    </div>
  );
}