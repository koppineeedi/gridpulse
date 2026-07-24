import React from "react";

const MetricCard = ({ title, value, unit, icon: Icon, description, trend, trendType }) => {
  const trendColor = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  }[trendType || "neutral"];

  return (
    <div className="glass-panel glass-panel-hover p-6 flex items-start justify-between">
      <div className="space-y-2">
        <span className="text-sm text-slate-400 font-medium block">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-outfit text-white tracking-tight">{value}</span>
          {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-slate-400/80 mt-1">
            {trend && <span className={`font-semibold mr-1 ${trendColor}`}>{trend}</span>}
            {description}
          </p>
        )}
      </div>
      {Icon && (
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/40 text-brandBlue">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default MetricCard;
