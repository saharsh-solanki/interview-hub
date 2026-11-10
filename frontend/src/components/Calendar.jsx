import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DOT_COLORS = {
  Screening: "bg-blue-500",
  L1: "bg-amber-500",
  L2: "bg-purple-500",
  HR: "bg-green-500",
};

export default function Calendar({ interviews = [], onDayClick, onSelectDate, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const interviewsByDate = useMemo(() => {
    const map = {};
    interviews.forEach((iv) => {
      const key = iv.date;
      if (!map[key]) map[key] = [];
      map[key].push(iv);
    });
    return map;
  }, [interviews]);

  const selectedAsDate = selectedDate instanceof Date
    ? selectedDate
    : selectedDate
      ? new Date(selectedDate + "T00:00:00")
      : null;

  const handleDayClick = (dateKey, dayDate) => {
    if (onSelectDate) onSelectDate(dayDate);
    if (onDayClick) onDayClick(dateKey);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-surface-muted transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-ink">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-2 rounded-lg hover:bg-surface-muted transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-ink-muted py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayInterviews = interviewsByDate[dateKey] || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const isSelected = selectedAsDate && isSameDay(day, selectedAsDate);

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(dateKey, day)}
              className={`relative p-1 min-h-[60px] sm:min-h-[72px] border border-border/50 flex flex-col items-center cursor-pointer transition-colors duration-150 ${
                !inMonth ? "opacity-30" : ""
              } ${isSelected ? "bg-primary/5" : "hover:bg-surface-muted"}`}
            >
              <span
                className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${
                  today
                    ? "ring-2 ring-primary text-primary font-semibold"
                    : "text-ink"
                } ${isSelected ? "bg-primary text-white ring-0" : ""}`}
              >
                {format(day, "d")}
              </span>

              {dayInterviews.length > 0 && (
                <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                  {dayInterviews.slice(0, 3).map((iv, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[iv.round] || "bg-gray-400"}`}
                    />
                  ))}
                  {dayInterviews.length > 3 && (
                    <span className="text-[10px] text-ink-muted leading-none">
                      +{dayInterviews.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
