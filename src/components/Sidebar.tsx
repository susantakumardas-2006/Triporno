import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { type LucideIcon, BookOpen, ClipboardList, LayoutGrid, MessageCircle, Trophy, User, Users2, Building2 } from 'lucide-react';

type SidebarItem = {
  to?: string;
  label: string;
  icon: LucideIcon;
  isBold?: boolean;
  onClick?: () => void;
};

type SidebarProps = {
  title: string;
  subTitle: string;
  items: SidebarItem[];
  isMobile?: boolean;
  isCollapsed?: boolean;
  hideHeader?: boolean;
  headerBadge?: ReactNode;
  onNavigate?: () => void;
};

export default function Sidebar({ title, subTitle, items, isMobile = false, isCollapsed = false, hideHeader = false, headerBadge, onNavigate }: SidebarProps) {
  const location = useLocation();
  const wrapperClass = isMobile
    ? 'flex flex-col gap-5 w-full'
    : `hidden xl:flex flex-col gap-5 ${isCollapsed ? 'w-[88px]' : 'w-[260px]'} shrink-0 sticky top-6 self-start`;

  return (
    <aside className={wrapperClass}>
      {!hideHeader ? (
        <div className="liquid-glass rounded-[28px] border border-white/10 p-5">
          <p className="uppercase tracking-[0.32em] text-white/50 text-xs mb-3">{title}</p>
          <h2 className="text-xl font-semibold">{subTitle}</h2>
          {headerBadge ? <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{headerBadge}</div> : null}
        </div>
      ) : null}
      <div className="liquid-glass rounded-[28px] border border-white/10 p-4">
        <nav className={isMobile ? 'flex flex-col gap-3' : 'flex flex-col gap-2'}>
          {items.map((item, index) => {
            const isActive = item.to ? location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) : false;
            const linkClasses = isMobile
              ? 'rounded-3xl px-4 py-4 gap-3'
              : isCollapsed
                ? 'rounded-3xl px-2 py-3 justify-center gap-0'
                : 'rounded-2xl px-4 py-3 gap-3';
            const labelClasses = isCollapsed ? 'sr-only' : `text-sm ${item.isBold ? 'font-semibold' : 'font-medium'}`;
            const commonProps = {
              key: `${item.label}-${index}`,
              className: `group flex items-center ${linkClasses} transition duration-300 ease-out transform motion-safe:will-change-transform ${isActive ? 'bg-white/10 text-white ring-1 ring-white/15 shadow-[0_10px_30px_rgba(255,255,255,0.06)]' : 'text-white/70 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white'}`,
              onClick: item.onClick ? item.onClick : onNavigate,
            } as const;

            return item.onClick ? (
              <button type="button" {...commonProps}>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition duration-300 ease-out ${isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white'}`}>
                  <item.icon size={18} />
                </span>
                <span className={labelClasses}>{item.label}</span>
              </button>
            ) : (
              <Link
                {...commonProps}
                to={item.to ?? '#'}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition duration-300 ease-out ${isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white'}`}>
                  <item.icon size={18} />
                </span>
                <span className={labelClasses}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {!isMobile ? (
        <div className="liquid-glass rounded-[28px] border border-white/10 p-5">
          <p className="text-white/70 text-sm">Always stay centered on your next strong move.</p>
        </div>
      ) : null}
    </aside>
  );
}
