"use client";

import { useState, useMemo, useEffect } from "react";
import { eachDayOfInterval, isWeekend, format } from "date-fns";

/**
 * TermDurationSummary
 * Props:
 *   termRange: { termOpens: string, termEnds: string }
 *   onEffectiveDaysChange: (days: number) => void
 */
export default function TermDurationSummary({
  termRange,
  onEffectiveDaysChange,
}) {
  const [holidays, setHolidays] = useState(0);

  const summary = useMemo(() => {
    if (!termRange?.termOpens || !termRange?.termEnds) return null;

    const start = new Date(termRange.termOpens);
    const end = new Date(termRange.termEnds);

    const allDays = eachDayOfInterval({ start, end });
    const weekdays = allDays.filter((d) => !isWeekend(d));
    const totalWeekdays = weekdays.length;
    const effectiveDays = Math.max(totalWeekdays - holidays, 0);

    return { totalWeekdays, effectiveDays };
  }, [termRange, holidays]);

  // 🔄 send the effective days to parent anytime it changes
  useEffect(() => {
    if (summary?.effectiveDays && onEffectiveDaysChange) {
      onEffectiveDaysChange(summary.effectiveDays);
    }
  }, [summary?.effectiveDays]);

  if (!termRange) return null;

  return (
    <div className="alert alert-info small py-2 mb-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <strong>📅 Term:</strong>{" "}
          {format(new Date(termRange.termOpens), "MMM d")} –{" "}
          {format(new Date(termRange.termEnds), "MMM d, yyyy")}
        </div>
        <div>
          <strong>Total Weekdays:</strong> {summary?.totalWeekdays || 0}
        </div>
        <div className="d-flex align-items-center gap-1">
          <label className="form-label mb-0 me-1">Holidays:</label>
          <input
            type="number"
            min="0"
            value={holidays}
            onChange={(e) => setHolidays(parseInt(e.target.value) || 0)}
            className="form-control shadow-none form-control-sm"
            style={{ width: 60 }}
          />
        </div>
        <div>
          <strong>Effective Days:</strong> {summary?.effectiveDays || 0}
        </div>
      </div>
    </div>
  );
}
