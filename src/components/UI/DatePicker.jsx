import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DatePicker({ value, onChange, label, placeholder = 'Select date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (day) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white text-sm font-medium focus:outline-none focus:bg-white/[0.05] focus:border-emerald-500/50 transition-all cursor-pointer flex items-center group"
      >
        <CalendarIcon className={`absolute left-5 w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors ${isOpen ? 'text-emerald-400' : ''}`} />
        <span className={value ? 'text-white' : 'text-slate-600'}>
          {value ? format(new Date(value), 'PPP') : placeholder}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[150] left-0 md:left-auto md:right-0 mt-2 p-5 bg-[#1A1F2B] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 backdrop-blur-xl w-[280px] sm:w-[320px]"
            style={{ 
              bottom: containerRef.current?.getBoundingClientRect().bottom > window.innerHeight - 350 ? '100%' : 'auto',
              marginBottom: containerRef.current?.getBoundingClientRect().bottom > window.innerHeight - 350 ? '1rem' : '0'
            }}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-white font-black text-sm uppercase tracking-widest italic">
                {format(viewDate, 'MMMM yyyy')}
              </h4>
              <div className="flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewDate(subMonths(viewDate, 1)); }}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setViewDate(addMonths(viewDate, 1)); }}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {days.map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-tighter py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = value && isSameDay(day, new Date(value));
                const isCurrentMonth = isSameMonth(day, monthStart);
                
                return (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                    className={`
                      aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all
                      ${!isCurrentMonth ? 'text-slate-800' : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                      ${isSelected ? 'bg-emerald-500 !text-white shadow-lg shadow-emerald-500/20' : ''}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDateClick(new Date()); }}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Set Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
