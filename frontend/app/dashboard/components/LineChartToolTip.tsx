import { CustomTooltipProps } from "@tremor/react";

const LineChartToolTip = ({ payload, active }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const category = payload[0];
  const dateParts = category.payload?.date?.split(",") || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[180px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full" />
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Requests
          </p>
          <p className="text-xl font-bold text-gray-900">
            {new Intl.NumberFormat("en-US").format(Number(category.value) || 0)}
          </p>
        </div>
      </div>
      {dateParts.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{dateParts[0]?.trim()}</p>
          {dateParts[1] && (
            <p className="text-xs text-gray-400">{dateParts[1]?.trim()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LineChartToolTip;
