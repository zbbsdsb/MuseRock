import { motion } from 'motion/react';
import { Compass, PenTool, Sparkles, BookOpen, ChevronRight, Github } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const features = [
    {
      icon: <Compass size={24} />,
      title: 'Prime',
      description: 'Define your intent, constraints, and creative direction before you start writing.'
    },
    {
      icon: <PenTool size={24} />,
      title: 'The Cloister',
      description: 'Deep writing with minimal distraction. AI stays silent while you focus.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Divergence',
      description: 'Explore contrasting ideas. AI generates divergent directions, not generic suggestions.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Reflection',
      description: 'Close your creative loop with three questions to capture what you learned.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-paper flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-black/30 font-black mb-4">
              Creative Companion
            </p>
            <h1 className="text-6xl lg:text-7xl font-serif italic font-light tracking-tight mb-6">
              Muse<span className="font-black">Rock</span>
            </h1>
            <p className="text-xl text-brand-black/60 font-serif italic max-w-2xl mx-auto mb-12">
              A structured creative loop for writers, designed to balance deep focus with divergent thinking.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="px-12 py-5 bg-brand-black text-white rounded-full text-[11px] uppercase tracking-[0.25em] font-black hover:opacity-90 transition-all shadow-xl flex items-center gap-3 mx-auto"
          >
            Start Creating
            <ChevronRight size={18} />
          </motion.button>

          <div className="mt-16 flex items-center justify-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-brand-black/40 hover:text-brand-black transition-colors">
              <Github size={20} />
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-brand-black text-white px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black mb-4">
              The Creative Loop
            </p>
            <h2 className="text-4xl font-serif italic font-light">
              Four stages. One seamless creative process.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 border border-white/10 rounded-2xl hover:border-white/30 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif italic mb-3">{feature.title}</h3>
                <p className="text-sm text-white/60 font-serif leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-black text-white/40 py-8 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-serif italic">
            © {new Date().getFullYear()} MuseRock. Made for writers who think differently.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[11px] uppercase tracking-widest font-black hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[11px] uppercase tracking-widest font-black hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
