import { useEffect, useRef, useState, type ReactNode } from "react";

export type AdminUser = {
  sub: string;
  role: string;
  email: string;
};

type AdminLayoutProps = {
  user: AdminUser | null;
  profileLoading: boolean;
  children: ReactNode;
  onLogout: () => void;
};

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

function IconUsers({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M13 7a4 4 0 100-8 4 4 0 000 8z" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M6 20v-1.2a4 4 0 014-3.8h4a4 4 0 014 3.8V20"
      />
    </svg>
  );
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M4 6.5A2.5 2.5 0 016.5 4H20v14H6.5A2.5 2.5 0 004 15.5V6.5zM20 18H6.5A2.5 2.5 0 004 20.5" />
    </svg>
  );
}

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
    </svg>
  );
}

function IconBus({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M4 6h16v10H4V6zm2 14h2v2H6v-2zm10 0h2v2h-2v-2zM6 8h4M14 8h4" />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0h6z" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" d="M4 6h16v12H4V6zm0 0l8 6 8-6" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M15 15l6 6" />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M8 6V4m8 2V4M4 10h16M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z"
      />
    </svg>
  );
}

function IconClipboard({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M9 4h6l1 2h3v14H5V6h3l1-2zm3 8v4m-2-2h4"
      />
    </svg>
  );
}

function IconGradCap({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M4.5 10.5L12 7l7.5 3.5L12 14 4.5 10.5zM9 12.3V16l3 1.5 3-1.5v-3.7"
      />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M12 3l9 5-9 5-9-5 9-5zm0 9l9 5-9 5-9-5 9-5z"
      />
    </svg>
  );
}

function IconWallet({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M4 7a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm14 5h3v4h-3a2 2 0 100-4z"
      />
    </svg>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M4 21V8l8-4v17M4 13h4M4 17h4M20 21h-8V10h8v11zm-4-7h.01M16 14h.01"
      />
    </svg>
  );
}

function IconPromotion({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20V9m0 0l-4 4m4-4l4 4M6 20h12"
      />
    </svg>
  );
}

function IconStore({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M3 10h18l-1.2 8.4a2 2 0 01-2 1.6H6.2a2 2 0 01-2-1.6L3 10zm0 0L2.5 6A1 1 0 013.5 5h17a1 1 0 011 .5L21 10M9 14h.01M15 14h.01"
      />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  );
}

function IconMegaphone({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 11v5l4 2v-9L4 11zm4-2l8-3v11l-8-3M16 8v8"
      />
    </svg>
  );
}

function IconChartBars({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" d="M5 19V11M12 19V5M19 19v-8" />
    </svg>
  );
}

function IconInsights({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2M4.5 7.5l1.4 1.4M3 14h2M4.5 20.5l1.4-1.4M12 21v-2M18.1 19.1l1.4-1.4M21 14h2M18.1 8.9l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path stroke="currentColor" strokeWidth="1.5" d="M3 12h18M12 3a14 14 0 000 18M12 3a14 14 0 010 18" />
    </svg>
  );
}

function IconBackup({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="17" rx="7" ry="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 17V9a7 7 0 0114 0v8M12 4v7m0 0l-2.5-2.5M12 11l2.5-2.5"
      />
    </svg>
  );
}

function IconRestore({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="17" rx="7" ry="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 17V9a7 7 0 00-14 0v8M12 20v-7m0 0l-2.5 2.5M12 13l2.5 2.5"
      />
    </svg>
  );
}

type NavIcon = typeof IconHome;

type NavLeaf = { icon?: NavIcon; label: string; badge?: string };

type NavGroup = { id: string; title: string; icon: NavIcon; items: NavLeaf[] };

const navGroups: NavGroup[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: IconHome,
    items: [],
  },
  {
    id: "student_hub",
    title: "Students",
    icon: IconUsers,
    items: [
      { icon: IconUsers, label: "All students" },
      { icon: IconClipboard, label: "New admissions" },
      { icon: IconGradCap, label: "Student profiles" },
    ],
  },
  {
    id: "classes",
    title: "Classes & sections",
    icon: IconGrid,
    items: [
      { icon: IconGrid, label: "Classes" },
      { icon: IconLayers, label: "Sections" },
    ],
  },
  {
    id: "staff",
    title: "Staff",
    icon: IconUsers,
    items: [
      { icon: IconGradCap, label: "Teaching staff" },
      { icon: IconBuilding, label: "Non-teaching staff" },
    ],
  },
  {
    id: "curriculum",
    title: "Curriculum & learning",
    icon: IconBook,
    items: [
      { icon: IconBook, label: "Academic syllabus" },
      { icon: IconLayers, label: "Subjects" },
      { icon: IconCalendar, label: "Class routine" },
      { icon: IconClipboard, label: "Attendance" },
      { icon: IconGradCap, label: "Exams" },
      { icon: IconClipboard, label: "Results" },
      { icon: IconPromotion, label: "Pupil promotion" },
    ],
  },
  {
    id: "operations",
    title: "Operations & finance",
    icon: IconWallet,
    items: [
      { icon: IconBook, label: "Library" },
      { icon: IconStore, label: "Store" },
      { icon: IconWallet, label: "Accounts" },
      { icon: IconBus, label: "Transport" },
      { icon: IconBuilding, label: "Hostel" },
      { icon: IconBuilding, label: "Hostel manager" },
      { icon: IconMegaphone, label: "All enquiries" },
      { icon: IconSettings, label: "Enquiry category" },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    icon: IconMail,
    items: [
      { icon: IconBell, label: "Notice board" },
      { icon: IconMail, label: "Messages" },
    ],
  },
  {
    id: "statistics",
    title: "Statistics",
    icon: IconChartBars,
    items: [],
  },
  {
    id: "insights",
    title: "Insights",
    icon: IconInsights,
    items: [],
  },
  {
    id: "settings",
    title: "Settings",
    icon: IconSettings,
    items: [
      { icon: IconGrid, label: "General" },
      { icon: IconBell, label: "Notifications" },
      { icon: IconUsers, label: "Users & roles" },
      { icon: IconBackup, label: "Backup" },
      { icon: IconRestore, label: "Restore data" },
    ],
  },
];

const defaultOpenGroups: Record<string, boolean> = {
  dashboard: false,
  student_hub: false,
  classes: false,
  staff: false,
  curriculum: false,
  operations: false,
  communication: false,
  statistics: false,
  insights: false,
  settings: false,
};

function displayName(email: string | null) {
  if (!email) return "Administrator";
  const local = email.split("@")[0] ?? email;
  return local.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ChevronDown({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function AdminLayout({
  user,
  profileLoading,
  children,
  onLogout,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({ ...defaultOpenGroups }));
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuProfile, setUserMenuProfile] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const name = displayName(user?.email ?? null);
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin";

  useEffect(() => {
    if (!userMenuOpen) return;
    function handlePointerDown(e: PointerEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setUserMenuProfile(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setUserMenuProfile(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [userMenuOpen]);

  function closeUserMenu() {
    setUserMenuOpen(false);
    setUserMenuProfile(false);
  }

  return (
    <div className="neo-app-bg flex min-h-screen flex-col text-[#2d3436] lg:flex-row">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#2d3436]/25 backdrop-blur-[3px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`neo-sidebar fixed inset-y-0 left-0 z-50 flex h-full min-h-0 w-[14rem] shrink-0 flex-col border-r border-white/40 text-[#2d3436] transition-transform duration-200 sm:w-[15rem] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-11 items-center gap-1.5 border-b border-white/30 px-2 sm:px-2.5">
          <button
            type="button"
            className="neo-icon-btn rounded-lg p-1.5 text-[#636e72] lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <MenuIcon />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="neo-logo flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black tracking-tight">
              Q
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold tracking-tight text-[#2d3436]">Queens</p>
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-[#636e72]">
                Junior School
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2" aria-label="Main navigation">
          <div className="space-y-1">
            {navGroups.map((group) => {
              const open = openGroups[group.id] ?? false;
              const GroupIcon = group.icon;
              const isFlat = group.items.length === 0;

              if (isFlat) {
                return (
                  <div key={group.id} className="rounded-xl">
                    <button
                      type="button"
                      className="group flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left neo-nav-group-idle rounded-xl"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/25 text-[#636e72] transition group-hover:bg-white/45 group-hover:text-[#2d3436]">
                        <GroupIcon className="h-[13px] w-[13px]" />
                      </span>
                      <span className="min-w-0 flex-1 text-xs font-semibold leading-tight text-[#2d3436]">
                        {group.title}
                      </span>
                    </button>
                  </div>
                );
              }

              return (
                <div key={group.id} className="rounded-xl">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => {
                        if (prev[group.id]) {
                          return { ...prev, [group.id]: false };
                        }
                        const next: Record<string, boolean> = {};
                        for (const g of navGroups) {
                          next[g.id] = false;
                        }
                        next[group.id] = true;
                        return next;
                      })
                    }
                    aria-expanded={open}
                    className={`group flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left ${
                      open ? "neo-nav-group-active" : "neo-nav-group-idle rounded-xl"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${
                        open
                          ? "bg-white/40 text-[#4a6b4e]"
                          : "bg-white/25 text-[#636e72] group-hover:bg-white/45 group-hover:text-[#2d3436]"
                      }`}
                    >
                      <GroupIcon className="h-[13px] w-[13px]" />
                    </span>
                    <span className="min-w-0 flex-1 text-xs font-semibold leading-tight">{group.title}</span>
                    <ChevronDown
                      open={open}
                      className={`h-4 w-4 shrink-0 ${open ? "text-[#4a6b4e]" : "text-[#636e72]"}`}
                    />
                  </button>
                  {open ? (
                    <ul className="neo-nav-sub mb-1 ml-3 mt-1 space-y-0 pb-0.5 pl-2.5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <li key={item.label}>
                            <button
                              type="button"
                              className="neo-nav-item flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] font-medium leading-snug text-[#636e72]"
                            >
                              {ItemIcon ? (
                                <ItemIcon className="h-3.5 w-3.5 shrink-0 text-[#5a8faf] opacity-90" />
                              ) : (
                                <span className="h-3.5 w-3.5 shrink-0" aria-hidden />
                              )}
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              {item.badge ? (
                                <span className="shrink-0 rounded bg-[#b9d9eb]/60 px-1 py-px text-[9px] font-bold text-[#2d3436]">
                                  {item.badge}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col self-stretch">
        <header className="neo-header sticky top-0 z-30 shrink-0 border-b border-white/50">
          <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 sm:gap-2 sm:px-4">
            <button
              type="button"
              className="neo-icon-btn rounded-lg p-1.5 text-[#636e72] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
            <div className="hidden min-w-0 max-w-md flex-1 md:block lg:max-w-xl">
              <label className="relative block">
                <span className="sr-only">Search</span>
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#636e72]" />
                <input
                  type="search"
                  placeholder="Search students, classes, reports…"
                  className="neo-inset w-full py-2 pl-9 pr-3 text-xs text-[#2d3436] outline-none transition placeholder:text-[#636e72]/80 focus:ring-2 focus:ring-[#b9d9eb]/60"
                />
              </label>
            </div>
            <div className="hidden min-w-0 flex-1 flex-col items-center justify-center px-1 lg:flex">
              <p className="truncate text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[#b8682a] sm:text-[11px]">
                School management system
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-1 sm:gap-1.5">
              <div
                className="hidden items-center gap-1 border-r border-[#ebe4d9]/80 pr-2 text-[10px] md:flex md:text-[11px]"
                title="Active academic session"
              >
                <span className="shrink-0 font-semibold text-[#b85c5c]">Running session:</span>
                <IconUser className="h-3.5 w-3.5 shrink-0 text-[#636e72]" />
                <span className="max-w-[6.5rem] truncate font-medium text-[#2d3436]">
                  {profileLoading ? "…" : name}
                </span>
              </div>
              <button
                type="button"
                className="hidden items-center gap-1.5 rounded-full bg-gradient-to-br from-[#cde8cf] to-[#9dc6a0] px-2.5 py-1 text-[10px] font-semibold text-[#2d3436] shadow-[2px_2px_6px_rgba(120,150,125,0.35),-2px_-2px_5px_rgba(255,255,255,0.85)] transition hover:brightness-105 sm:flex sm:text-[11px]"
              >
                <IconGlobe className="shrink-0" />
                Change language
              </button>
              <button
                type="button"
                className="neo-icon-btn relative p-2 text-[#636e72]"
                aria-label="Notifications"
              >
                <IconBell />
                <span className="absolute right-0 top-0 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-gradient-to-br from-[#f7d1cd] to-[#e8a8a2] px-0.5 text-[9px] font-bold text-[#2d3436] shadow-sm">
                  5
                </span>
              </button>
              <button
                type="button"
                className="neo-icon-btn relative p-2 text-[#636e72]"
                aria-label="Messages"
              >
                <IconMail />
                <span className="absolute right-0 top-0 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-gradient-to-br from-[#b9d9eb] to-[#8bb8d4] px-0.5 text-[9px] font-bold text-[#2d3436] shadow-sm">
                  8
                </span>
              </button>
              <div className="relative ml-0.5" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (userMenuOpen) {
                      closeUserMenu();
                    } else {
                      setUserMenuProfile(false);
                      setUserMenuOpen(true);
                    }
                  }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label={profileLoading ? "Account menu, loading" : `Account menu, signed in as ${name}`}
                  className={`neo-icon-btn p-2 text-[#2d3436] ${
                    userMenuOpen
                      ? "bg-gradient-to-br from-[#cde8cf] to-[#b8d8ba] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06)]"
                      : ""
                  }`}
                >
                  {profileLoading ? (
                    <span className="flex h-5 w-5 items-center justify-center text-[10px] text-[#636e72]">
                      …
                    </span>
                  ) : (
                    <IconUser />
                  )}
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    aria-orientation="vertical"
                    className="neo-dropdown absolute right-0 top-full z-[60] mt-3 w-[min(100vw-2rem,18rem)] overflow-hidden py-2"
                  >
                    {!userMenuProfile ? (
                      <>
                        <div className="border-b border-[#ebe4d9] bg-gradient-to-br from-[#e8f4fc] to-[#f5f0e6] px-4 pb-3 pt-2">
                          <p className="truncate text-sm font-semibold text-[#2d3436]">{name}</p>
                          <p className="mt-0.5 truncate text-xs text-[#636e72]">{user?.email ?? "—"}</p>
                          <p className="mt-2 inline-flex rounded-full bg-[#b8d8ba] px-2.5 py-0.5 text-[11px] font-semibold text-[#2d3436] shadow-[2px_2px_4px_rgba(120,150,125,0.25)]">
                            {roleLabel}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-[#2d3436] transition hover:bg-[#b9d9eb]/35"
                          onClick={() => setUserMenuProfile(true)}
                        >
                          Manage profile
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full px-4 py-2.5 text-left text-sm font-semibold text-[#c0392b] transition hover:bg-[#f7d1cd]/50"
                          onClick={() => {
                            closeUserMenu();
                            onLogout();
                          }}
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2">
                        <button
                          type="button"
                          className="mb-3 flex items-center gap-1 text-xs font-semibold text-[#5a8faf] hover:text-[#2d3436]"
                          onClick={() => setUserMenuProfile(false)}
                        >
                          <span aria-hidden>←</span> Back
                        </button>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#636e72]">
                          Your account
                        </p>
                        <label className="mt-3 block text-xs font-medium text-[#636e72]">Email</label>
                        <p className="neo-inset-field mt-1 px-3 py-2 text-sm text-[#2d3436]">
                          {user?.email ?? "—"}
                        </p>
                        <label className="mt-3 block text-xs font-medium text-[#636e72]">Display name</label>
                        <p className="neo-inset-field mt-1 px-3 py-2 text-sm text-[#2d3436]">
                          {name}
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-[#636e72]">
                          Password and profile updates can be wired to your API when ready.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1">{children}</div>

        <footer className="neo-footer shrink-0 border-t border-white/40 py-3.5 text-center text-xs font-medium text-[#636e72]">
          © {new Date().getFullYear()} Queens Junior School · School management system
        </footer>
      </div>
    </div>
  );
}
