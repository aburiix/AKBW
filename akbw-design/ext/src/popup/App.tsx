import { useState } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import { useActiveTab } from "@/hooks/useActiveTab";
import { useSettings } from "@/hooks/useSettings";
import { MainView } from "./screens/MainView";
import { SettingsView } from "./screens/SettingsView";
import { HistoryView } from "./screens/HistoryView";

export type View = "main" | "settings" | "history";

export default function App() {
  const [view, setView] = useState<View>("main");
  const { settings, update, loaded } = useSettings();
  const tab = useActiveTab();

  return (
    <ToastProvider>
      <div className="flex h-full w-full flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {view === "main" && (
          <MainView
            tab={tab}
            settings={settings}
            loaded={loaded}
            onOpenSettings={() => setView("settings")}
            onOpenHistory={() => setView("history")}
          />
        )}
        {view === "settings" && (
          <SettingsView
            settings={settings}
            update={update}
            onBack={() => setView("main")}
          />
        )}
        {view === "history" && <HistoryView onBack={() => setView("main")} />}
      </div>
    </ToastProvider>
  );
}
