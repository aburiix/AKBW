import { useState } from "react";
import type { AppSettings } from "@/types/settings";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { SelectField } from "@/components/SelectField";
import { Toggle } from "@/components/Toggle";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PanelCloseButton } from "@/components/PanelCloseButton";
import { useToasts } from "@/hooks/useToasts";
import { storage } from "@/storage";
import { DARK_MODE_OPTIONS, LANGUAGE_OPTIONS } from "@/constants";

interface SettingsViewProps {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  onBack: () => void;
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function SettingsView({ settings, update, onBack }: SettingsViewProps) {
  const { notify } = useToasts();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = async (): Promise<void> => {
    await storage.clearProductData();
    await storage.setHistory([]);
    notify("success", "Barcha ma'lumotlar o'chirildi.");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-1.5 border-b border-zinc-200 bg-white px-2.5 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Orqaga"
        >
          <Icon name="back" size={16} />
        </button>
        <h2 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
          Sozlamalar
        </h2>
        <div className="flex-1" />
        <PanelCloseButton />
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
        <SettingsSection title="Ulanish">
          <TextField
            label="API URL"
            icon="server"
            mono
            value={settings.backendUrl}
            placeholder="https://api.example.com"
            hint="Import so'rovlari shu manzilga jo'natiladi."
            onChange={(event) => update({ backendUrl: event.target.value })}
          />
          <TextField
            label="JWT Token"
            type="password"
            icon="key"
            value={settings.token}
            placeholder="Bearer token (ixtiyoriy)"
            hint="Bo'sh qoldirilsa, token .env (ADMIN_LOGIN/ADMIN_PASSWORD) orqali avtomatik olinadi."
            onChange={(event) => update({ token: event.target.value })}
          />
        </SettingsSection>

        <SettingsSection title="Import">
          <SelectField
            label="Til"
            value={settings.language}
            onChange={(event) => update({ language: event.target.value })}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <Toggle
            checked={settings.clearAfterImport}
            onChange={(checked) => update({ clearAfterImport: checked })}
            label="Importdan so'ng formani tozalash"
            description="Mahsulot muvaffaqiyatli qo'shilsa, maydonlarni avtomatik tozalash."
          />
          <Toggle
            checked={settings.rememberSelections}
            onChange={(checked) => update({ rememberSelections: checked })}
            label="Tanlovlarni eslab qolish"
            description="Xuddi shu saytda tanlovlarni panel yopilganda ham saqlash."
          />
        </SettingsSection>

        <SettingsSection title="Ko'rinish">
          <SelectField
            label="Mavzu"
            value={settings.darkMode}
            onChange={(event) =>
              update({ darkMode: event.target.value as AppSettings["darkMode"] })
            }
          >
            {DARK_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </SettingsSection>

        <SettingsSection title="Ma'lumotlar">
          <Button
            variant="danger"
            size="sm"
            icon={<Icon name="trash" size={13} />}
            onClick={() => setConfirmReset(true)}
          >
            Barcha ma'lumotlarni o'chirish
          </Button>
          <p className="text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
            Tanlangan mahsulot ma'lumotlari va import tarixi o'chiriladi.
            Sozlamalar saqlanib qoladi.
          </p>
        </SettingsSection>

        <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
          Sozlamalar avtomatik saqlanadi
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Barcha ma'lumotlarni o'chirish?"
        description="Bu amalni ortga qaytarib bo'lmaydi."
        confirmLabel="O'chirish"
        danger
        onConfirm={() => void handleReset()}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
