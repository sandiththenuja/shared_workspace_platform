import React, { useState, useEffect } from 'react';
import { 
  // Navigation
  Menu, X, 
  // Logo & Brand
  Calculator, Rocket, Users, Shield, 
  // Actions
  ArrowRight, Play, CheckCircle,
  // Features
  MessageSquare, ClipboardList, Bot, FolderOpen, PenTool, LineChart,
  // Social
  GitBranch, Link, TestTube,
  // UI
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '12K+', label: 'Active Teams' },
    { value: '1.4M', label: 'Messages Sent' },
    { value: '89%', label: 'Productivity Increase' },
    { value: '4.9★', label: 'User Satisfaction' }
  ];

  const features = [
    { icon: MessageSquare, title: 'Real-Time Chat', desc: 'Instant messaging with threads, reactions, and AI-powered smart replies.' },
    { icon: ClipboardList, title: 'Task Boards', desc: 'Drag-and-drop kanban boards with task assignment, priority, and progress tracking.' },
    { icon: Bot, title: 'AI Assistant', desc: 'AI-powered writing, summarization, and intelligent task suggestions.' },
    { icon: FolderOpen, title: 'File Management', desc: 'Organized file storage with folder structure, versioning, and previews.' },
    { icon: PenTool, title: 'Whiteboard', desc: 'Collaborative drawing and brainstorming with real-time updates.' },
    { icon: LineChart, title: 'Analytics & Reports', desc: 'Track team activity, productivity metrics, and export detailed reports.' }
  ];

  const testimonials = [
    {
      name: 'Sarah Kim',
      role: 'Product Lead, DesignFlow',
      text: '"CollabNest transformed how our remote team works. It\'s like having an office in your browser — everything we need, all in one place."',
      avatar: 'SK'
    },
    {
      name: 'Marcus Reed',
      role: 'CTO, CloudSync',
      text: '"The AI assistant alone saves our team hours every week. The task board and file management are game-changers for our workflow."',
      avatar: 'MR'
    },
    {
      name: 'Amy Lin',
      role: 'Operations, StudioX',
      text: '"We switched from three different tools to CollabNest. Productivity went up, and our team loves the clean, modern interface."',
      avatar: 'AL'
    }
  ];

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-lg shadow-sm border-b border-slate-200/50' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200/30'
      }`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 font-bold text-xl text-slate-900">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Calculator className="w-4 h-4 text-white" />
            </span>
            <span className="bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
              CollabNest
            </span>
          </a>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-slate-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-500 after:transition-all hover:after:w-full">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a href="#" className="hidden md:inline-block px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:border-indigo-400 hover:text-indigo-600 transition-all">
              Sign In
            </a>
            <button onClick={() => navigate('/login')} href="#" className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              Get Started
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200/50 py-4 px-4 shadow-lg">
            <ul className="flex flex-col gap-3 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="block py-2 px-3 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2 border-t border-slate-200/50">
                <a href="#" className="block w-full py-2.5 text-center font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-28 md:pt-36 pb-12 md:pb-20 px-4 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center min-h-[90vh]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
              <Rocket className="w-3 h-3 text-indigo-500" /> AI-Powered
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
              <Users className="w-3 h-3 text-indigo-500" /> 500+ Teams
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
              <Shield className="w-3 h-3 text-indigo-500" /> Enterprise Grade
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            The <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">all-in-one</span> workspace for modern teams
          </h1>

          <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
            Chat, collaborate, and create — all in one place. AI-powered, real-time, and built for teams of any size.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-200 font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all">
              <Play className="w-4 h-4" /> See Demo
            </a>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> 14-day free trial</span>
          </div>
        </div>

        {/* Mock Dashboard */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-sm font-semibold text-slate-700">Workspace · Product Team</span>
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <div className="space-y-2">
            {[
              { initials: 'JD', name: 'John Doe', status: 'Online', color: 'from-indigo-500 to-purple-600' },
              { initials: 'AK', name: 'Alex Kim', status: 'Away', color: 'from-emerald-500 to-emerald-600' },
              { initials: 'SM', name: 'Sarah Miller', status: 'Busy', color: 'from-amber-500 to-amber-600' },
              { initials: 'LR', name: 'Lisa Ray', status: 'Online', color: 'from-pink-500 to-pink-600' }
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-semibold`}>
                  {user.initials}
                </div>
                <div className="flex-1">
                  <div className="w-24 h-2.5 rounded-full bg-slate-200"></div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  user.status === 'Online' ? 'bg-emerald-100 text-emerald-700' :
                  user.status === 'Away' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full"><ClipboardList className="inline mr-1 w-3 h-3" /> 12 tasks</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full"><MessageSquare className="inline mr-1 w-3 h-3" /> 8 unread</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full"><FolderOpen className="inline mr-1 w-3 h-3" /> 5 files</span>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-12 px-4 max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-y border-slate-200/50">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-0.5">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-16 md:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything your team needs</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            From chat to task boards, AI assistance to file sharing — CollabNest brings it all together.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 text-xl mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-16 md:py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Loved by teams worldwide</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="text-amber-400 text-sm mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="inline w-4 h-4" />)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">{t.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{t.name}</h4>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="pricing" className="py-16 md:py-20 px-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to build your workspace?</h2>
          <p className="text-white/80 text-lg mb-6 max-w-lg mx-auto">
            Join thousands of teams already using CollabNest to collaborate, create, and get work done.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#" className="inline-block px-8 py-3.5 rounded-full bg-white text-indigo-600 font-semibold hover:bg-slate-50 hover:-translate-y-0.5 transition-all">
              Start Free Trial
            </a>
            <a href="#" className="inline-block px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-all">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="pt-12 pb-6 px-4 max-w-6xl mx-auto border-t border-slate-200/50">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <a href="#" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 mb-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Calculator className="w-4 h-4 text-white" />
              </span>
              <span className="bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent">
                CollabNest
              </span>
            </a>
            <p className="text-sm text-slate-500 max-w-xs">All-in-one workspace for modern teams. AI-powered collaboration, real-time communication, and project management.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"><X className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"><GitBranch className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"><Link className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all"><TestTube className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <span>&copy; 2025 CollabNest. All rights reserved.</span>
          <span className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Cookies</a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;