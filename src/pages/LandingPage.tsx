import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Globe, Instagram, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import students from '../../database/students.json';
import faculty from '../../database/faculty.json';
import institutes from '../../database/institutes.json';
import { authenticateUser } from '../lib/auth';

type Role = 'student' | 'faculty' | 'institute';

const roleLabels: Record<Role, string> = {
  student: 'Student',
  faculty: 'Faculty',
  institute: 'Institute',
};

const demoHints: Record<Role, string> = {
  student: 'Demo credentials: student@smarted.demo / demo1234',
  faculty: 'Demo credentials: faculty@smarted.demo / demo1234',
  institute: 'Demo credentials: institute@smarted.demo / demo1234',
};

function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const opacityRef = useRef(1);
  const fadingOutRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeTo = (target: number, duration: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      const startOpacity = opacityRef.current;
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        const next = startOpacity + (target - startOpacity) * progress;
        opacityRef.current = next;
        setOpacity(next);
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const playLoop = () => {
      video.play().catch(() => undefined);
      fadeTo(1, 500);
    };

    const handleTimeUpdate = () => {
      if (video.duration - video.currentTime <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fadeTo(0, 500);
      }
    };

    const handleEnded = () => {
      setOpacity(0);
      opacityRef.current = 0;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => undefined);
        fadingOutRef.current = false;
        fadeTo(1, 500);
      }, 100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    playLoop();

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    const accounts = {
      student: authenticateUser(students, normalizedEmail, normalizedPassword),
      faculty: authenticateUser(faculty, normalizedEmail, normalizedPassword),
      institute: authenticateUser(institutes as Array<{ email?: string; password?: string }>, normalizedEmail, normalizedPassword),
    };

    if (role === 'student' && accounts.student) {
      navigate('/app/student/dashboard');
      return;
    }
    if (role === 'faculty' && accounts.faculty) {
      navigate('/app/faculty/dashboard');
      return;
    }
    if (role === 'institute' && accounts.institute) {
      navigate('/app/institute/overview');
      return;
    }

    setError('Incorrect email or password. Try the demo credentials shown above.');
  };

  const handleKeyToggle = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    const roles: Role[] = ['student', 'faculty', 'institute'];
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const nextIndex = event.key === 'ArrowRight'
        ? (index + 1) % roles.length
        : (index - 1 + roles.length) % roles.length;
      setRole(roles[nextIndex]);
    }
  };

  const navLinks = useMemo(() => ['student', 'faculty', 'institute'] as Role[], []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex flex-col">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
        muted
        playsInline
        autoPlay
        loop={false}
        style={{ opacity }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <nav className="relative z-20 px-6 py-6">
        <div className="rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto liquid-glass shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <div className="rounded-full bg-white/10 p-2">
              <Globe size={20} />
            </div>
            <span>SmartEd</span>
          </div>
          <button onClick={() => navigate('/auth/register')} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:-translate-y-0.5 hover:bg-neutral-200">
            Register
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[8%]">
        <div className="max-w-5xl w-full">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Fresh, calmer onboarding for learners and educators
          </div>
          <h1 className="text-white mb-4 tracking-tight text-4xl md:text-5xl lg:text-6xl leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
            SmartEd: Built for the curious
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-white/70 md:text-lg">
            Jump into your workspace with a clearer sign-in flow, smoother role switching, and a more polished first impression.
          </p>

          <div className="liquid-glass rounded-3xl p-8 w-full max-w-md mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="rounded-full bg-white/5 p-1 flex" role="tablist" aria-label="Choose your role">
              {navLinks.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`flex-1 text-center text-sm py-2.5 rounded-full transition-all duration-300 ${role === item ? 'bg-white text-black font-medium shadow-[0_8px_24px_rgba(255,255,255,0.18)]' : 'text-white/60 hover:text-white/80 hover:bg-white/10'}`}
                  onClick={() => setRole(item)}
                  onKeyDown={(e) => handleKeyToggle(e, index)}
                >
                  {roleLabels[item]}
                </button>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/60 text-xs mt-3">
              {demoHints[role]}
            </div>
            <form onSubmit={handleLogin} className="mt-4">
              {error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-2 mb-3" aria-live="polite">
                  {error}
                </div>
              ) : null}
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Email"
                  className="w-full rounded-full bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none transition-all duration-200 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
                <div className="flex items-center rounded-full bg-white/10 px-4 py-3 transition-all duration-200 focus-within:bg-white/15 focus-within:ring-2 focus-within:ring-white/20">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Password"
                    className="w-full text-white placeholder:text-white/40 outline-none bg-transparent"
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-white/70 transition hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="bg-white text-black rounded-full py-3 font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-200 hover:shadow-[0_10px_24px_rgba(255,255,255,0.18)] w-full mt-4">
                Log in as {roleLabels[role]}
              </button>
              <div className="mt-3 text-center">
                <span className="text-white/60 text-xs">Need an account? </span>
                <button type="button" onClick={() => navigate('/auth/register')} className="text-white text-xs font-medium transition hover:text-white/80">
                  Register
                </button>
              </div>
            </form>
          </div>

          <div className="max-w-xl w-full space-y-4 mt-8 mx-auto">
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 transition hover:bg-white/10">
              <input className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none" placeholder="Email address" />
              <button className="rounded-full bg-white p-2 text-black transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,255,255,0.16)]" type="button">
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-white/70 text-sm">Subscribe for updates, product notes, and classroom inspiration.</p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <button aria-label="Instagram" className="liquid-glass rounded-full p-4 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:bg-white/10">
          <Instagram size={20} />
        </button>
        <button aria-label="Twitter" className="liquid-glass rounded-full p-4 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:bg-white/10">
          <Twitter size={20} />
        </button>
        <button aria-label="Globe" className="liquid-glass rounded-full p-4 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:bg-white/10">
          <Globe size={20} />
        </button>
      </footer>
    </div>
  );
}

export default LandingPage;
