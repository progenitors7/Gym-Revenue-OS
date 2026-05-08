export default function DashboardSkeleton() {
  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-48 mb-2"></div>
      <div className="h-4 bg-slate-800 rounded w-64 mb-8"></div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="h-64 bg-slate-800 rounded-2xl"></div>
           <div className="h-64 bg-slate-800 rounded-2xl"></div>
        </div>
        <div className="space-y-8">
           <div className="h-48 bg-slate-800 rounded-2xl"></div>
           <div className="h-48 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}
