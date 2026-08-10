import { useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { exportPhotoBackup, importPhotoBackup } from "../../utils/photoBackup";
import { exportFullBackup } from "../../utils/fullBackup";
import {
  ArrowDown,
  ArrowUp,
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  FileText,
  ImageDown,
  ImageUp,
  Minus,
  Trash2,
  Upload,
} from "lucide-react";

export default function DataManagementCard({
  records,
  settings,
  onImportData,
  onDeleteAllData,
  onGenerateTestData,
}) {
  const fileInputRef = useRef(null);
  const photoBackupInputRef = useRef(null);

  function exportCsv() {
    if (records.length === 0) {
      alert("Todavía no hay registros para exportar.");
      return;
    }

    const sortedRecords = [...records].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const headers = ["Fecha", "Calorías", "Peso (kg)", "Rendimiento", "Notas"];

    const rows = sortedRecords.map((record) => [
      record.date,
      Number(record.calories),
      Number(record.weight).toFixed(1),
      record.performance || "",
      record.notes || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    downloadFile({
      content: `\uFEFF${csvContent}`,
      fileName: `fitness-tracker-registros-${getToday()}.csv`,
      type: "text/csv;charset=utf-8",
    });
  }
  async function handleFullBackup() {
    try {
      await exportFullBackup({
        records,
        settings,
      });

      alert("Respaldo completo generado correctamente.");
    } catch (error) {
      console.error("No se pudo generar el respaldo completo:", error);

      alert("No se pudo generar el respaldo completo.");
    }
  }
  function exportPdf() {
    if (records.length === 0) {
      alert("Todavía no hay registros para generar el PDF.");
      return;
    }

    try {
      const sortedRecords = [...records].sort((a, b) =>
        a.date.localeCompare(b.date),
      );

      const firstRecord = sortedRecords[0];
      const latestRecord = sortedRecords[sortedRecords.length - 1];

      const averageCalories = Math.round(
        sortedRecords.reduce(
          (total, record) => total + Number(record.calories),
          0,
        ) / sortedRecords.length,
      );

      const initialWeight = Number(firstRecord.weight);
      const currentWeight = Number(latestRecord.weight);

      const weightChange = Number((currentWeight - initialWeight).toFixed(1));

      const trainingRecords = sortedRecords.filter(
        (record) =>
          record.performance === "Óptimo" ||
          record.performance === "Regular" ||
          record.performance === "Fallido",
      );

      const restRecords = sortedRecords.filter(
        (record) => record.performance === "Descanso",
      );

      const optimalCount = trainingRecords.filter(
        (record) => record.performance === "Óptimo",
      ).length;

      const optimalPercentage = trainingRecords.length
        ? Math.round((optimalCount / trainingRecords.length) * 100)
        : 0;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setProperties({
        title: "Reporte Fitness Tracker",
        subject: "Reporte de calorías, peso y rendimiento",
        author: "Fitness Tracker",
      });

      // Encabezado
      pdf.setFillColor(24, 24, 27);
      pdf.rect(0, 0, 210, 38, "F");

      pdf.setTextColor(163, 230, 53);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(21);
      pdf.text("FITNESS TRACKER", 15, 17);

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text("Reporte de progreso", 15, 26);

      pdf.setTextColor(161, 161, 170);
      pdf.setFontSize(8);
      pdf.text(`Generado: ${formatGeneratedDate()}`, 15, 33);

      // Configuración
      pdf.setTextColor(24, 24, 27);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Configuración actual", 15, 49);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      pdf.text(`Etapa: ${settings.mode}`, 15, 58);

      pdf.text(
        `Meta diaria: ${Number(settings.goalCalories).toLocaleString(
          "es-MX",
        )} kcal`,
        75,
        58,
      );

      pdf.text(
        `Peso objetivo: ${Number(settings.goalWeight).toFixed(1)} kg`,
        145,
        58,
      );

      // Resumen
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text("Resumen", 15, 72);

      autoTable(pdf, {
        startY: 78,
        theme: "grid",

        head: [
          [
            "Periodo",
            "Promedio kcal",
            "Peso inicial",
            "Peso actual",
            "Cambio",
            "Óptimo",
            "Descansos",
          ],
        ],

        body: [
          [
            `${formatRecordDate(firstRecord.date)} - ${formatRecordDate(
              latestRecord.date,
            )}`,
            `${averageCalories.toLocaleString("es-MX")} kcal`,
            `${initialWeight.toFixed(1)} kg`,
            `${currentWeight.toFixed(1)} kg`,
            `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg`,
            trainingRecords.length ? `${optimalPercentage}%` : "Sin sesiones",
            restRecords.length,
          ],
        ],

        styles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          textColor: [39, 39, 42],
          lineColor: [212, 212, 216],
          lineWidth: 0.2,
          halign: "center",
          valign: "middle",
        },

        headStyles: {
          fillColor: [39, 39, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        columnStyles: {
          0: { cellWidth: 39 },
          1: { cellWidth: 25 },
          2: { cellWidth: 24 },
          3: { cellWidth: 24 },
          4: { cellWidth: 21 },
          5: { cellWidth: 23 },
          6: { cellWidth: 20 },
        },

        margin: {
          left: 15,
          right: 15,
        },
      });

      const summaryEndY = pdf.lastAutoTable?.finalY ?? 100;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(24, 24, 27);
      pdf.text("Historial de registros", 15, summaryEndY + 12);

      const historyRows = sortedRecords.map((record) => [
        formatRecordDate(record.date),
        `${Number(record.calories).toLocaleString("es-MX")} kcal`,
        `${Number(record.weight).toFixed(1)} kg`,
        record.performance || "Sin dato",
        record.notes || "Sin notas",
      ]);

      autoTable(pdf, {
        startY: summaryEndY + 18,

        head: [["Fecha", "Calorías", "Peso", "Rendimiento", "Notas"]],

        body: historyRows,

        theme: "striped",

        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          textColor: [39, 39, 42],
          lineColor: [228, 228, 231],
          lineWidth: 0.1,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fillColor: [163, 230, 53],
          textColor: [24, 24, 27],
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [244, 244, 245],
        },

        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 27 },
          2: { cellWidth: 22 },
          3: { cellWidth: 29 },
          4: { cellWidth: 74 },
        },

        margin: {
          top: 15,
          right: 15,
          bottom: 18,
          left: 15,
        },

        didDrawPage: (data) => {
          const pageNumber = pdf.internal.getCurrentPageInfo().pageNumber;

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(113, 113, 122);

          pdf.text(
            `Fitness Tracker · Página ${pageNumber}`,
            data.settings.margin.left,
            290,
          );
        },
      });

      pdf.save(`fitness-tracker-reporte-${getToday()}.pdf`);
    } catch (error) {
      console.error("No se pudo generar el PDF:", error);

      alert(
        "No se pudo generar el PDF. Revisa que jspdf-autotable esté instalado.",
      );
    }
  }

  async function handleExportPhotoBackup() {
    try {
      await exportPhotoBackup();

      alert("Respaldo de fotos generado correctamente.");
    } catch (error) {
      console.error("No se pudo exportar el respaldo de fotos:", error);

      alert(error.message || "No se pudo generar el respaldo de fotografías.");
    }
  }

  async function handleImportPhotoBackup(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const confirmed = window.confirm(
        "¿Importar este respaldo de fotografías?",
      );

      if (!confirmed) {
        return;
      }

      const importedCount = await importPhotoBackup(file);

      alert(`Se importaron ${importedCount} registros fotográficos.`);
    } catch (error) {
      console.error("No se pudo importar el respaldo de fotos:", error);

      alert("No se pudo importar el respaldo fotográfico.");
    } finally {
      event.target.value = "";
    }
  }
  function exportBackup() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      records,
      settings,
    };

    downloadFile({
      content: JSON.stringify(backup, null, 2),
      fileName: `fitness-tracker-backup-${getToday()}.json`,
      type: "application/json",
    });
  }

  async function importData(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const backup = JSON.parse(content);

      if (
        !Array.isArray(backup.records) ||
        !backup.settings ||
        typeof backup.settings !== "object"
      ) {
        throw new Error("Formato de respaldo inválido.");
      }

      const validRecords = backup.records.filter(
        (record) =>
          record &&
          typeof record.date === "string" &&
          Number.isFinite(Number(record.calories)) &&
          Number.isFinite(Number(record.weight)),
      );

      if (backup.records.length > 0 && validRecords.length === 0) {
        throw new Error("El respaldo no contiene registros válidos.");
      }

      const confirmed = window.confirm(
        "¿Importar este respaldo? Los datos actuales serán reemplazados.",
      );

      if (!confirmed) {
        return;
      }

      onImportData({
        records: validRecords,
        settings: backup.settings,
      });

      alert("Respaldo importado correctamente.");
    } catch (error) {
      console.error("No se pudo importar el respaldo:", error);

      alert(
        "No se pudo importar el archivo. Verifica que sea un respaldo JSON válido.",
      );
    } finally {
      event.target.value = "";
    }
  }

  function deleteAllData() {
    const confirmed = window.confirm(
      "¿Eliminar todos los registros? Esta acción no se puede deshacer.",
    );

    if (!confirmed) {
      return;
    }

    const secondConfirmation = window.confirm(
      "¿Estás completamente seguro de eliminar todos tus registros?",
    );

    if (secondConfirmation) {
      onDeleteAllData();
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <DatabaseBackup className="text-lime-400" size={28} />

        <div>
          <h2 className="text-2xl font-bold">Administración de datos</h2>

          <p className="text-sm text-zinc-400">
            Exporta tu historial, crea respaldos o restaura tus datos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <ActionButton
          onClick={exportCsv}
          icon={<FileSpreadsheet size={19} />}
          title="Exportar a Excel"
          description="Descarga tus registros en formato CSV."
          className="bg-lime-400 text-black hover:bg-lime-300"
        />

        <ActionButton
          onClick={exportPdf}
          icon={<FileText size={19} />}
          title="Generar PDF"
          description="Descarga un reporte completo de tu progreso."
          className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        />

        <ActionButton
          onClick={exportBackup}
          icon={<Download size={19} />}
          title="Crear respaldo"
          description="Guarda registros y configuración en JSON."
          className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        />
        <ActionButton
          onClick={handleExportPhotoBackup}
          icon={<ImageDown size={19} />}
          title="Respaldar fotos"
          description="Descarga todas tus fotografías en un ZIP."
          className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        />

        <ActionButton
          onClick={() => photoBackupInputRef.current?.click()}
          icon={<ImageUp size={19} />}
          title="Importar fotos"
          description="Restaura un respaldo ZIP de fotografías."
          className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        />

        <ActionButton
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload size={19} />}
          title="Importar respaldo"
          description="Restaura un archivo JSON exportado."
          className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
        />

        <ActionButton
          onClick={deleteAllData}
          icon={<Trash2 size={19} />}
          title="Eliminar registros"
          description="Borra permanentemente todo el historial."
          className="border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
        />
        <ActionButton
          onClick={handleFullBackup}
          icon={<DatabaseBackup size={19} />}
          title="Respaldo completo"
          description="Descarga registros, configuración y fotografías en un solo ZIP."
          className="bg-lime-400 text-black hover:bg-lime-300"
        />
        <ActionButton
          onClick={() => onGenerateTestData("descending")}
          icon={<ArrowDown size={19} />}
          title="Prueba: descenso"
          description="Genera 365 días con una tendencia descendente y fluctuaciones reales."
          className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
        />

        <ActionButton
          onClick={() => onGenerateTestData("maintenance")}
          icon={<Minus size={19} />}
          title="Prueba: mantenimiento"
          description="Genera 365 días con peso estable y fluctuaciones normales."
          className="border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
        />

        <ActionButton
          onClick={() => onGenerateTestData("ascending")}
          icon={<ArrowUp size={19} />}
          title="Prueba: ascenso"
          description="Genera 365 días con una tendencia ascendente y fluctuaciones reales."
          className="border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={importData}
        className="hidden"
      />

      <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm font-semibold">Formatos disponibles</p>

        <div className="mt-2 grid gap-2 text-sm text-zinc-400 md:grid-cols-3">
          <p>
            <strong className="text-zinc-200">CSV:</strong> análisis en Excel.
          </p>

          <p>
            <strong className="text-zinc-200">PDF:</strong> reporte visual para
            guardar o compartir.
          </p>

          <p>
            <strong className="text-zinc-200">JSON:</strong> respaldo completo
            para restaurar la app.
          </p>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ onClick, icon, title, description, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 text-left transition ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 font-bold">
        {icon}
        {title}
      </div>

      <p className="text-xs leading-relaxed opacity-75">{description}</p>
    </button>
  );
}

function downloadFile({ content, fileName, type }) {
  const file = new Blob([content], {
    type,
  });

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  const escapedText = text.replaceAll('"', '""');

  return `"${escapedText}"`;
}

function formatRecordDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatGeneratedDate() {
  return new Date().toLocaleString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
