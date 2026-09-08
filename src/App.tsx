import { useEffect, useState, type ReactNode } from "react";
import { AdminScreen } from "./screens/Admin";
import { AuthScreen } from "./screens/AuthScreen";
import { Dashboard } from "./screens/Dashboard";
import { Flashcards } from "./screens/Flashcards";
import { Library } from "./screens/Library";
import { Profile } from "./screens/Profile";
import { QuizScreen } from "./screens/QuizScreen";
import { SubjectDetail } from "./screens/SubjectDetail";
import { DataProvider } from "./store";
import type { Navigate, Route } from "./types";
import { Icon } from "./ui";
import { getCurrentAccount } from "./auth";
import { logoutAccount } from "./auth";

type NavItem = { key: Route["name"]; label: string; icon: string; route: Route };

function BottomNav({ route, onNavigate }: { route: Route; onNavigate: Navigate }) {
  const { navItems } = useNav();
  const active = route.name;
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t-[2.5px] border-ink bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Điều hướng chính"
    >
      <div className="mx-auto flex h-16 max-w-xl items-stretch gap-1 px-2">
        {navItems.map(item => {
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onNavigate(item.route)}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl border-[2.5px] transition-all duration-150",
                selected
                  ? "-translate-y-1 border-ink bg-yellow text-ink shadow-hard"
                  : "border-transparent text-muted hover:bg-surface2",
              ].join(" ")}
            >
              <Icon name={item.icon} size={22} filled={selected} />
              <span className="text-[9px] font-extrabold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarNav({ route, onNavigate }: { route: Route; onNavigate: Navigate }) {
  const { mainItems } = useNav();
  const active = route.name;
  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r-[2.5px] border-ink bg-surface lg:flex"
      aria-label="Điều hướng chính"
    >
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5">
        {mainItems.map(item => {
          const selected = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onNavigate(item.route)}
              className={[
                "flex items-center gap-3 rounded-full border-[2.5px] px-4 py-3 text-sm font-extrabold transition-all duration-150",
                selected
                  ? "border-ink bg-yellow text-ink shadow-hard"
                  : "border-transparent text-muted hover:bg-surface2",
              ].join(" ")}
            >
              <Icon name={item.icon} size={22} filled={selected} />
              {item.label}
            </button>
          );
        })}

      </nav>

      <div className="border-t-[2.5px] border-ink p-4">
        <div className="flex items-center gap-3 rounded-2xl border-[2.5px] border-ink bg-surface2 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-cyan text-sm font-extrabold text-ink">
            M
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-ink">Nguyễn Nhật Minh</p>
            <p className="text-[11px] font-bold text-muted">Học sinh Vàng</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function useNav(): { navItems: NavItem[]; mainItems: NavItem[] } {
  const mainItems: NavItem[] = [
    { key: "home", label: "Trang chủ", icon: "home", route: { name: "home" } },
    { key: "profile", label: "Cá nhân", icon: "person", route: { name: "profile" } },
  ];
  return { navItems: mainItems, mainItems };
}

function AppInner() {
  const [route, setRoute] = useState<Route>(() => window.location.pathname === "/adminqtitpc" ? { name: "admin" } : { name: "home" });
  const [account, setAccount] = useState(() => getCurrentAccount());

  const navigate: Navigate = nextRoute => {
    setRoute(nextRoute);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const showNav = route.name !== "quiz" && route.name !== "admin";
  if (route.name !== "admin" && !account) {
    return <AuthScreen onSuccess={() => setAccount(getCurrentAccount())} />;
  }
  const routeKey = JSON.stringify(route);

  let screen: ReactNode;
  if (route.name === "home") {
    screen = <Dashboard onNavigate={navigate} />;
  } else if (route.name === "library") {
    screen = <Library onNavigate={navigate} />;
  } else if (route.name === "subject") {
    screen = (
      <SubjectDetail
        subjectId={route.subjectId}
        onBack={() => navigate({ name: "home" })}
        onNavigate={navigate}
      />
    );
  } else if (route.name === "quiz") {
    screen = <QuizScreen key={route.variant} initialVariant={route.variant} onExit={() => navigate({ name: "home" })} />;
  } else if (route.name === "flashcard") {
    screen = <Flashcards key={route.subjectId} subjectId={route.subjectId} onBack={() => navigate({ name: "home" })} />;
  } else if (route.name === "profile") {
    screen = <Profile onNavigate={navigate} accountName={account?.name} onLogout={() => { logoutAccount(); setAccount(null); }} />;
  } else {
    screen = <AdminScreen onExit={() => navigate({ name: "home" })} />;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {showNav && <SidebarNav route={route} onNavigate={navigate} />}
      <div className={showNav ? "lg:pl-64" : ""}>
        <div key={routeKey} className="screen-enter">
          {screen}
        </div>
      </div>
      {showNav && <BottomNav route={route} onNavigate={navigate} />}
    </div>
  );
}

export function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
