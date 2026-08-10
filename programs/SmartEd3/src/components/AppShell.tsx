import { ReactNode, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';

type NavItem = {
  to?: string;
  label: string;
  icon: any;
  isBold?: boolean;
  onClick?: () => void;
};

type AppShellProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  navItems: NavItem[];
  sidebarHeaderBadge?: ReactNode;
  children: ReactNode;
};

export default function AppShell({ title, subtitle, actions, navItems, sidebarHeaderBadge, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const activeLabel = useMemo(
    () => navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))?.label ?? 'Overview',
    [location.pathname, navItems]
  );

  return (
    <div className="min-h-screen bg-black text-white fade-slide-up">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="liquid-glass rounded-[32px] border border-white/10 p-8 mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">{title}</p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">{navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`))?.label ?? 'Overview'}</span>
              </div>
              <h1 className="text-4xl font-semibold section-heading">{subtitle}</h1>
            </div>
            <div className="flex items-center gap-3">
              {actions ? <div className="hidden sm:flex flex-wrap gap-3">{actions}</div> : null}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((value) => !value)}
                className="hidden xl:inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((value) => !value)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 xl:hidden"
                aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {navItems.length ? (
            <div className="mt-6 hidden xl:flex flex-wrap gap-3 pop-in">
              {navItems.map((item) => {
                const isActive = item.to ? location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) : false;
                const navClasses = `rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 ${isActive ? 'bg-white/10 text-white' : ''}`;
                if (item.onClick && !item.to) {
                  return (
                    <button key={item.label} type="button" onClick={item.onClick} className={navClasses}>
                      {item.label}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={item.to ?? '#'}
                    className={navClasses}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-black/75 px-6 py-6 xl:hidden">
            <div className="liquid-glass h-full rounded-[32px] border border-white/10 p-6 overflow-auto shadow-2xl shadow-black/40 pop-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="uppercase tracking-[0.32em] text-white/50 text-xs">Navigation</p>
                  <h2 className="text-2xl font-semibold mt-2">Quick links</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>
              <Sidebar title={title} subTitle={subtitle} items={navItems} isMobile hideHeader onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex flex-col xl:flex-row gap-6">
          <Sidebar title={title} subTitle={subtitle} items={navItems} isCollapsed={sidebarCollapsed} headerBadge={sidebarHeaderBadge} />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
