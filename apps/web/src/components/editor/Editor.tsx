interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  return (
    <section className="max-w-4xl mx-auto w-full flex-1 overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-full">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="The sky above the port was the color of a television..."
          className="w-full h-full bg-transparent text-xl leading-[1.8] font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none pr-4 py-4"
        />
      </div>
      <div className="absolute bottom-4 right-0 text-[10px] uppercase tracking-widest font-black text-brand-black/20 pointer-events-none group-hover:text-brand-black/40 transition-colors">
        {content.split(/\s+/).filter(x => x).length} Words Collected
      </div>
    </section>
  );
}
