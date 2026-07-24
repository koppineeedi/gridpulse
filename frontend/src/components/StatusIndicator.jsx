import React from "react";

const StatusIndicator = ({ status }) => {
  const statusStyles = {
    HEALTHY: {
      dot: "bg-emerald-500 glow-green",
      text: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5",
      label: "Healthy",
    },
    WARNING: {
      dot: "bg-amber-500 glow-amber",
      text: "text-amber-400 border-amber-500/10 bg-amber-500/5",
      label: "Warning",
    },
    FAULT: {
      dot: "bg-red-500 glow-red",
      text: "text-red-400 border-red-500/10 bg-red-500/5",
      label: "Fault",
    },
  }[status?.toUpperCase() || "HEALTHY"];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles.text}`}>
      <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
      {statusStyles.label}
    </span>
  );
};

export default StatusIndicator;
