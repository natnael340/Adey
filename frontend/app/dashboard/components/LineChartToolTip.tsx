import { CustomTooltipProps } from "@tremor/react";

const LineChartToolTip = ({ payload, active }: CustomTooltipProps) => {
  if (!active || !payload) return null;
  return (
    <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border">
      {payload.map((category, idx) => (
        <div key={idx} className="flex flex-1 justify-between">
          <div key={idx} className="flex space-x-2.5">
            <div className={`w-1 bg-amber-300 rounded`} />
            <div className="space-y-1">
              <p className="text-tremor-content">Request</p>
              <p className="font-medium text-tremor-content-emphasis">
                {category.value}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center items-end">
            <p className="text-gray-400 text-xs">
              {category.payload.date.split(",")[0]}
            </p>
            <p className="text-gray-400 text-xs">
              {category.payload.date.split(",")[1]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LineChartToolTip;
