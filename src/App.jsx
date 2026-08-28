import { useEffect, useState } from "react";
import AppHeader from "./components/common/AppHeader";
import TodaySummary from "./components/dashboard/TodaySummary";
import AddRecordCard from "./components/dashboard/AddRecordCard";
import Toast from "./components/common/Toast";
import ReportsCard from "./components/reports/ReportsCard";
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
import AuthScreen from "./components/auth/AuthScreen";
import { useAuth } from "./context/AuthContext";
import { logoutUser } from "./services/authService";
import {
  deleteUserRecord,
  getUserData,
  saveUserRecord,
  saveUserSettings,
} from "./services/firestoreService";

const initialSettings = {
  goalCalories: 2100,
  goalWeight: 67,
  mode: "Perder peso",
};

function App() {
  const { user, authLoading } = useAuth();
  const [records, setRecords] = useState([]);
  const [settings, setSettings] = useState(initialSettings);
  const [dataLoading, setDataLoading] = useState(true);

  const [editingRecord, setEditingRecord] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    let isActive = true;

    async function loadUserData() {
      if (!user) {
        setRecords([]);
        setSettings(initialSettings);
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);

        const userData = await getUserData(user.uid);

        if (!isActive) {
          return;
        }

        setRecords(userData.records);

        setSettings({
          ...initialSettings,
          ...(userData.settings ?? {}),
        });
      } catch (error) {
        console.error("No se pudieron cargar los datos de Firestore:", error);

        if (isActive) {
          setToast({
            title: "Error al cargar",
            message: "No se pudieron obtener tus datos de Firebase.",
            type: "error",
          });
        }
      } finally {
        if (isActive) {
          setDataLoading(false);
        }
      }
    }

    loadUserData();

    return () => {
      isActive = false;
    };
  }, [user]);

  async function saveRecord(record) {
    if (!user) {
      return;
    }

    const isEditing = Boolean(record.id);

    const recordToSave = {
      ...record,
      id: record.id ?? crypto.randomUUID(),
    };

    const duplicateRecord = records.find(
      (item) => item.date === recordToSave.date && item.id !== recordToSave.id,
    );

    try {
      await saveUserRecord(user.uid, recordToSave);

      if (duplicateRecord) {
        await deleteUserRecord(user.uid, duplicateRecord.id);
      }

      setRecords((previousRecords) => {
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
        title: isEditing ? "Registro actualizado" : "Registro guardado",
        message: `Se guardó la información del ${formatToastDate(
          recordToSave.date,
        )}.`,
      });
    } catch (error) {
      console.error("No se pudo guardar el registro:", error);

      showToast({
        title: "Error al guardar",
        message: "No se pudo guardar el registro en Firebase.",
        type: "error",
      });
    }
  }

  async function deleteRecord(id) {
    if (!user) {
      return;
    }

    try {
      await deleteUserRecord(user.uid, id);

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
    } catch (error) {
      console.error("No se pudo eliminar el registro:", error);

      showToast({
        title: "Error al eliminar",
        message: "No se pudo eliminar el registro de Firebase.",
        type: "error",
      });
    }
  }
  async function saveSettings(newSettings) {
    if (!user) {
      return;
    }

    try {
      await saveUserSettings(user.uid, newSettings);

      setSettings(newSettings);

      showToast({
        title: "Configuración guardada",
        message: `${newSettings.mode} · ${Number(
          newSettings.goalCalories,
        ).toLocaleString("es-MX")} kcal · ${Number(
          newSettings.goalWeight,
        ).toFixed(1)} kg`,
      });
    } catch (error) {
      console.error("No se pudo guardar la configuración:", error);

      showToast({
        title: "Error al guardar",
        message: "No se pudo guardar la configuración en Firebase.",
        type: "error",
      });
    }
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
  if (authLoading || (user && dataLoading)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Cargando...
      </main>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <AppHeader
        user={user}
        onOpenSettings={() => setSettingsOpen(true)}
        onLogout={logoutUser}
      />

      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6" id="app-content">
        <section id="inicio" className="scroll-mt-24">
          <TodaySummary
            records={records}
            settings={settings}
            onOpenSettings={() => setSettingsOpen(true)}
          />
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
        <section id="fotos" className="scroll-mt-24 space-y-6">
          <ProgressPhotosCard records={records} onShowToast={showToast} />
        </section>

        <section id="historial" className="scroll-mt-24">
          <HistoryCard
            records={records}
            onSaveRecord={saveRecord}
            onDeleteRecord={deleteRecord}
          />
        </section>
        <section id="reportes" className="scroll-mt-24">
          <ReportsCard records={records} settings={settings} user={user} />
        </section>

        <footer className="pb-4 pt-2 text-center text-xs text-zinc-600">
          Fitness Tracker v1.0.0 · Tus registros se sincronizan de forma segura
          con tu cuenta.
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
