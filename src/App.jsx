import { useEffect, useState } from "react";
import AppHeader from "./components/common/AppHeader";
import TodaySummary from "./components/dashboard/TodaySummary";
import AddRecordCard from "./components/dashboard/AddRecordCard";
import Toast from "./components/common/Toast";
import DataManagementCard from "./components/dashboard/DataManagementCard";
import InsightsCard from "./components/dashboard/InsightsCard";
import WeeklyComparisonCard from "./components/dashboard/WeeklyComparisonCard";
import PhaseStatusCard from "./components/dashboard/PhaseStatusCard";
import CaloriesPerformanceCard from "./components/dashboard/CaloriesPerformanceCard";
import CaloriesCard from "./components/calories/CaloriesCard";
import WeightCard from "./components/weight/WeightCard";
import PerformanceCard from "./components/performance/PerformanceCard";
import HistoryCard from "./components/history/HistoryCard";
import SettingsModal from "./components/dashboard/SettingsModal";
import ProgressPhotosCard from "./components/dashboard/ProgressPhotosCard";
const RECORDS_STORAGE_KEY = "fitness-tracker-records";
const SETTINGS_STORAGE_KEY = "fitness-tracker-settings";

const initialSettings = {
  goalCalories: 2100,
  goalWeight: 67,
  mode: "Déficit",
};

function App() {
  const [records, setRecords] = useState(() => {
    try {
      const savedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);

      return savedRecords ? JSON.parse(savedRecords) : [];
    } catch (error) {
      console.error("No se pudieron cargar los registros:", error);

      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

      return savedSettings ? JSON.parse(savedSettings) : initialSettings;
    } catch (error) {
      console.error("No se pudo cargar la configuración:", error);

      return initialSettings;
    }
  });

  const [editingRecord, setEditingRecord] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error("No se pudieron guardar los registros:", error);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("No se pudo guardar la configuración:", error);
    }
  }, [settings]);

  function saveRecord(record) {
    setRecords((previousRecords) => {
      const recordToSave = {
        ...record,
        id: record.id ?? crypto.randomUUID(),
      };

      const recordsWithoutDuplicate = previousRecords.filter(
        (item) =>
          item.id !== recordToSave.id && item.date !== recordToSave.date,
      );

      return [recordToSave, ...recordsWithoutDuplicate].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
    });

    setEditingRecord(null);
    showToast({
      title: record.id ? "Registro actualizado" : "Registro guardado",
      message: `Se guardó la información del ${formatToastDate(record.date)}.`,
    });
  }

  function deleteRecord(id) {
    setRecords((previousRecords) =>
      previousRecords.filter((record) => record.id !== id),
    );

    if (editingRecord?.id === id) {
      setEditingRecord(null);
    }

    showToast({
      title: "Registro eliminado",
      message: "El registro se eliminó correctamente.",
      type: "info",
    });
  }
  function saveSettings(newSettings) {
    setSettings(newSettings);

    showToast({
      title: "Configuración guardada",
      message: `${newSettings.mode} · ${Number(
        newSettings.goalCalories,
      ).toLocaleString("es-MX")} kcal · ${Number(
        newSettings.goalWeight,
      ).toFixed(1)} kg`,
    });
  }
  function importData(data) {
    const importedRecords = [...data.records].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    setRecords(importedRecords);

    setSettings({
      ...initialSettings,
      ...data.settings,
    });

    setEditingRecord(null);
  }

  function deleteAllData() {
    setRecords([]);
    setEditingRecord(null);

    showToast({
      title: "Registros eliminados",
      message: "Se eliminó todo el historial correctamente.",
      type: "info",
    });
  }
  function showToast({ title, message = "", type = "success" }) {
    setToast({
      title,
      message,
      type,
    });

    window.clearTimeout(showToast.timeoutId);

    showToast.timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  function startEditing(record) {
    setEditingRecord(record);

    requestAnimationFrame(() => {
      document.getElementById("registro")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <AppHeader onOpenSettings={() => setSettingsOpen(true)} />

      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <section id="inicio" className="scroll-mt-24">
          <TodaySummary records={records} settings={settings} />
        </section>

        <section id="registro" className="scroll-mt-24">
          <AddRecordCard
            onSaveRecord={saveRecord}
            editingRecord={editingRecord}
            onCancelEdit={() => setEditingRecord(null)}
          />
        </section>

        <section id="analisis" className="scroll-mt-24 space-y-6">
          <CaloriesCard
            records={records}
            goalCalories={settings.goalCalories}
          />

          <InsightsCard records={records} />

          <WeeklyComparisonCard records={records} />

          <PhaseStatusCard records={records} settings={settings} />

          <CaloriesPerformanceCard records={records} />
        </section>

        <section id="progreso" className="scroll-mt-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <WeightCard records={records} />

            <PerformanceCard records={records} />
          </div>
        </section>
        <section id="fotos" className="scroll-mt-24">
          <ProgressPhotosCard records={records} onShowToast={showToast} />
        </section>

        <section id="historial" className="scroll-mt-24">
          <HistoryCard
            records={records}
            onEditRecord={startEditing}
            onDeleteRecord={deleteRecord}
          />
        </section>

        <section id="datos" className="scroll-mt-24">
          <DataManagementCard
            records={records}
            settings={settings}
            onImportData={importData}
            onDeleteAllData={deleteAllData}
          />
        </section>

        <footer className="pb-4 pt-2 text-center text-xs text-zinc-600">
          Fitness Tracker v1.0.0 Tus datos permanecen almacenados localmente en
          este navegador.
        </footer>
      </div>
      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={saveSettings}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}

export default App;

function formatToastDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
