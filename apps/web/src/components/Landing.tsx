import { motion } from 'motion/react';
import { Compass, PenTool, Sparkles, BookOpen, ChevronRight, Github, Brain, Layers, BookMarked, ExternalLink } from 'lucide-react';

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

      {/* Research & Scientific Foundations */}
      <section className="bg-brand-paper px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-brand-black/30 font-black mb-4">
              Research & Scientific Foundations
            </p>
            <h2 className="text-4xl font-serif italic font-light text-brand-black mb-4">
              Built on cognitive science & creative research
            </h2>
            <p className="text-xl text-brand-black/60 font-serif italic max-w-2xl mx-auto">
              MuseRock's architecture draws from decades of research in cognitive psychology, creative writing, and human-computer interaction.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* 5-Layer Memory System */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-10 border border-brand-black/10 rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-black/5 flex items-center justify-center mb-8">
                <Layers size={28} className="text-brand-black" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black mb-4">
                5-Layer Memory System
              </h3>
              <p className="text-brand-black/60 font-serif leading-relaxed mb-6">
                Inspired by theories of working memory and creative cognition [1], our system maintains multiple levels of memory: sensory buffer, working memory, episodic buffer, semantic memory, and long-term creative repository. This structure enables deep contextual understanding while preserving creative continuity [2].
              </p>
              <div className="space-y-3">
                {['Sensory Buffer', 'Working Memory', 'Episodic Buffer', 'Semantic Memory', 'Creative Repository'].map((layer, i) => (
                  <div key={layer} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-black/10 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                    <span className="text-brand-black/70 font-serif">{layer}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Creative Loop Architecture */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-10 border border-brand-black/10 rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-black/5 flex items-center justify-center mb-8">
                <Brain size={28} className="text-brand-black" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black mb-4">
                Creative Loop Architecture
              </h3>
              <p className="text-brand-black/60 font-serif leading-relaxed mb-6">
                Our four-stage loop (Prime → The Cloister → Divergence → Reflection) is grounded in the creative process model developed by Csikszentmihalyi [3] and extended by contemporary writing research [4]. This cycle balances focused production with exploratory thinking.
              </p>
              <div className="flex items-center justify-between">
                {['Prime', 'Cloister', 'Divergence', 'Reflection'].map((stage, i) => (
                  <div key={stage} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-brand-black/5 flex items-center justify-center mx-auto mb-2">
                      <span className="text-[10px] font-black">{i + 1}</span>
                    </div>
                    <span className="text-xs text-brand-black/70 font-serif">{stage}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Citations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-brand-black/5 p-8 rounded-2xl mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookMarked size={20} className="text-brand-black/60" />
              <h4 className="text-lg font-serif italic text-brand-black">Academic References</h4>
            </div>
            <div className="space-y-3 text-sm text-brand-black/60 font-serif">
              <p>[1] Baddeley, A. D. (2000). The episodic buffer: a new component of working memory? <em>Trends in Cognitive Sciences</em>, 4(11), 417-423.</p>
              <p>[2] Ericsson, K. A., & Kintsch, W. (1995). Long-term working memory. <em>Psychological Review</em>, 102(2), 211-245.</p>
              <p>[3] Csikszentmihalyi, M. (1996). <em>Creativity: Flow and the psychology of discovery and invention</em>. HarperCollins.</p>
              <p>[4] Hayles, N. K. (2012). <em>How we think: Digital media and contemporary technogenesis</em>. University of Chicago Press.</p>
            </div>
          </motion.div>

          {/* Link to Technical Documentation */}
          <div className="text-center">
            <a 
              href="#" 
              className="inline-flex items-center gap-3 px-8 py-4 border border-brand-black/20 text-brand-black rounded-full text-[11px] uppercase tracking-[0.25em] font-black hover:bg-brand-black hover:text-white transition-all"
            >
              Read Technical Documentation
              <ExternalLink size={16} />
            </a>
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
