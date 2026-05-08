export default function LightweightChart({ data, height = 160 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 100); // Ensure at least some scale
  
  return (
    <div className="flex items-end gap-2 w-full pt-4" style={{ height }}>
      {data.map((item, index) => {
        const heightPercent = `${(item.value / maxValue) * 100}%`;
        return (
          <div key={index} className="flex-1 flex flex-col items-center group relative">
            {/* Tooltip on hover */}
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-xl border border-slate-700">
              ₹{item.value}
            </div>
            
            {/* Bar */}
            <div className="w-full flex justify-center items-end h-full">
              <div 
                className="w-full max-w-[32px] bg-indigo-500/40 rounded-t-sm group-hover:bg-indigo-400 transition-all duration-300 relative overflow-hidden"
                style={{ height: heightPercent, minHeight: '4px' }}
              >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
              </div>
            </div>
            
            {/* Label */}
            <span className="text-[10px] text-slate-500 mt-2 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
