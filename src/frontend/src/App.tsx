import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  Brain,
  Calendar,
  ChevronRight,
  Dumbbell,
  Home,
  TrendingUp,
  Trophy,
  User,
  Utensils,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { OnboardingModal } from "./components/OnboardingModal";
import { AppProvider, useApp } from "./context/AppContext";
import { useNotifications } from "./hooks/useNotifications";
import { AIConfigPage } from "./pages/AIConfigPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LibraryPage } from "./pages/LibraryPage";
import { NutritionPage } from "./pages/NutritionPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgressPage } from "./pages/ProgressPage";

type Tab = "home" | "workouts" | "library" | "progress" | "account";
type SubPage =
  | "programs"
  | "history"
  | "nutrition"
  | "calendar"
  | "aiconfig"
  | null;

const VALID_TABS: Tab[] = [
  "home",
  "workouts",
  "library",
  "progress",
  "account",
];

const TAB_ITEMS: { id: Tab; label: string; Icon: React.FC<any> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "workouts", label: "Workouts", Icon: Dumbbell },
  { id: "library", label: "Library", Icon: BookOpen },
  { id: "progress", label: "Progress", Icon: TrendingUp },
  { id: "account", label: "Account", Icon: User },
];

const BG_MAP: Record<string, string> = {
  "text-teal": "bg-teal/10",
  "text-yellow": "bg-yellow/10",
  "text-red-400": "bg-red-400/10",
};

function getTabFromHash(): Tab {
  const hash = window.location.hash.replace("#", "") as Tab;
  return VALID_TABS.includes(hash) ? hash : "home";
}

function AppShell() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>(() => getTabFromHash());
  const [subPage, setSubPage] = useState<SubPage>(null);

  useNotifications(state.notificationTime);

  // Sync hash to history on mount (in case there's no hash yet)
  useEffect(() => {
    const currentTab = getTabFromHash();
    if (!window.location.hash) {
      window.history.replaceState({ tab: currentTab }, "", `#${currentTab}`);
    }
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const tab = event.state?.tab as Tab | undefined;
      if (tab && VALID_TABS.includes(tab)) {
        setActiveTab(tab);
        setSubPage(null);
      } else {
        // Fallback: read from hash
        const hashTab = getTabFromHash();
        setActiveTab(hashTab);
        setSubPage(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const showOnboarding =
    !state.isLoading && !state.hasOnboarded && !state.profile;

  const renderContent = () => {
    // Sub-pages accessible from workouts tab
    if (activeTab === "workouts") {
      if (subPage === "programs") return <ProgramsPage />;
      if (subPage === "history") return <HistoryPage />;
      if (subPage === "nutrition") return <NutritionPage />;
      if (subPage === "calendar") return <CalendarPage />;
      if (subPage === "aiconfig") return <AIConfigPage />;

      return <WorkoutsMenu onNavigate={(page: SubPage) => setSubPage(page)} />;
    }

    switch (activeTab) {
      case "home":
        return (
          <DashboardPage
            onNavigateToWorkouts={() => handleTabChange("workouts", "programs")}
          />
        );
      case "library":
        return <LibraryPage />;
      case "progress":
        return <ProgressPage />;
      case "account":
        return <ProfilePage />;
      default:
        return (
          <DashboardPage
            onNavigateToWorkouts={() => handleTabChange("workouts", "programs")}
          />
        );
    }
  };

  const handleTabChange = (tab: Tab, sub?: SubPage) => {
    setActiveTab(tab);
    setSubPage(sub ?? null);
    window.history.pushState({ tab }, "", `#${tab}`);
  };

  const handleSubPageBack = () => {
    setSubPage(null);
    // Push a workouts state so back button works naturally
    window.history.pushState({ tab: "workouts" }, "", "#workouts");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-2xl mx-auto relative">
      {/* Top app bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {subPage && activeTab === "workouts" && (
            <button
              type="button"
              onClick={handleSubPageBack}
              className="p-1.5 rounded-lg hover:bg-muted mr-1"
              data-ocid="nav.secondary_button"
            >
              ←
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-teal flex items-center justify-center">
              <Brain className="w-4 h-4 text-black" />
            </div>
            <span className="text-base font-display font-bold text-foreground">
              FitCoach AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center">
            <span className="text-xs font-bold text-black">
              {state.profile?.name?.charAt(0) || "FC"}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${subPage}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom tab navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background/90 backdrop-blur-md border-t border-white/5 z-30"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch h-16">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors min-h-[44px] ${
                  isActive
                    ? "text-teal"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-ocid={`nav.${tab.id}.tab`}
              >
                <tab.Icon
                  className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
                />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-teal"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Onboarding */}
      <AnimatePresence>{showOnboarding && <OnboardingModal />}</AnimatePresence>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.155 0.005 260)",
            color: "oklch(0.955 0 0)",
            border: "1px solid oklch(1 0 0 / 0.08)",
          },
        }}
      />
    </div>
  );
}

function WorkoutsMenu({ onNavigate }: { onNavigate: (page: SubPage) => void }) {
  const { state } = useApp();

  const MENU_ITEMS = [
    {
      id: "programs" as SubPage,
      label: "Training Programs",
      desc: "Browse & enroll in programs",
      icon: Trophy,
      color: "text-red-400",
    },
    {
      id: "history" as SubPage,
      label: "Workout History",
      desc: `${state.workouts.length} sessions logged`,
      icon: Dumbbell,
      color: "text-teal",
    },
    {
      id: "nutrition" as SubPage,
      label: "Nutrition Log",
      desc: "Track meals & macros",
      icon: Utensils,
      color: "text-yellow",
    },
    {
      id: "calendar" as SubPage,
      label: "Workout Calendar",
      desc: "Schedule & plan",
      icon: Calendar,
      color: "text-teal",
    },
    {
      id: "aiconfig" as SubPage,
      label: "AI Coach Settings",
      desc: "Tune AI behavior",
      icon: Brain,
      color: "text-yellow",
    },
  ];

  return (
    <div className="pb-tab">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6">
          Workouts
        </h1>
        <div className="space-y-3">
          {MENU_ITEMS.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onNavigate(item.id)}
              className="w-full card-surface rounded-xl p-4 flex items-center gap-4 hover:border-white/10 transition-all text-left"
              data-ocid={`workouts.${item.id}.button`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  BG_MAP[item.color] ?? "bg-muted"
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
