const TypingIndicator = () => (
  <div className="flex items-center gap-2 text-xs text-slate-400 px-4 py-2">
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300" />
    typing...
  </div>
);

export default TypingIndicator;

