export default function StatCard({ title, value, subtitle, icon, colorClass, trend }) {
  // colorClass expects a base color string like 'emerald', 'sky', 'indigo', 'amber', 'rose'
  
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  const selectedColor = colors[colorClass] || colors.slate;

  return (
    <div className="p-5 rounded-2xl glass-card flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${selectedColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
            trend.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 
            trend.startsWith('-') ? 'text-rose-400 bg-rose-500/10' : 
            'text-slate-400 bg-slate-500/10'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</h3>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
