/**
 * StatusBadge.jsx
 * Displays a colour-coded pill for member status.
 */
export default function StatusBadge({ status }) {
  const map = {
    active: {
      label: 'Active',
      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    expiring_soon: {
      label: 'Expiring Soon',
      cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-400',
    },
    expired: {
      label: 'Expired',
      cls: 'bg-red-500/10 text-red-400 border-red-500/20',
      dot: 'bg-red-400',
    },
  }

  const cfg = map[status] ?? map.expired

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
