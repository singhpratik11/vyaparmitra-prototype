import React from 'react';
import { Lock } from 'lucide-react';

/** Brand order: the oldest cohort is navy, the newest teal. */
const LINE_COLOURS = ['#123B78', '#1265A8', '#10B8A5'];

// Plot geometry. Hand-drawn SVG rather than a charting dependency — four points per line.
const WIDTH = 760;
const HEIGHT = 320;
const LEFT = 56;
const RIGHT = 720;
const TOP = 18;
const BOTTOM = 268;
const GRID_LINES = [100, 75, 50, 25, 0];

/**
 * The same cohort numbers the table above shows, drawn as one line per activation month.
 * A line stops at the last elapsed month rather than running through a null.
 */
export default function CohortRetentionChart({ months, cohorts }) {
  const stepX = (RIGHT - LEFT) / (months.length - 1);
  const xFor = (monthIndex) => LEFT + monthIndex * stepX;
  const yFor = (value) => BOTTOM - (value / 100) * (BOTTOM - TOP);

  return (
    <div className="mt-6 pt-6 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#526174]">
            Retention Curve
          </h4>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Share of each cohort still recording verified transactions, month by month.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>Simulated — directional only, not live retention (small n)</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full max-w-[880px] h-auto"
        role="img"
        aria-label="Retention by activation cohort, month 0 to month 3"
      >
        {/* Y axis: 0-100% */}
        {GRID_LINES.map((value) => (
          <g key={value}>
            <line
              x1={LEFT}
              y1={yFor(value)}
              x2={RIGHT}
              y2={yFor(value)}
              stroke="#F1F5F9"
              strokeWidth="1"
            />
            <text
              x={LEFT - 12}
              y={yFor(value) + 4}
              textAnchor="end"
              className="fill-[#526174]"
              fontSize="12"
              fontFamily="inherit"
            >
              {value}%
            </text>
          </g>
        ))}

        {/* X axis: the elapsed months */}
        <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} stroke="#E2E8F0" strokeWidth="1" />
        {months.map((month, index) => (
          <text
            key={month}
            x={xFor(index)}
            y={BOTTOM + 28}
            textAnchor="middle"
            className="fill-[#526174]"
            fontSize="12"
            fontFamily="inherit"
          >
            {month}
          </text>
        ))}

        {cohorts.map((cohort, cohortIndex) => {
          const colour = LINE_COLOURS[cohortIndex % LINE_COLOURS.length];
          // Only the elapsed months are plotted, so a line ends where its data does.
          const points = cohort.retention
            .map((value, monthIndex) => ({ value, monthIndex }))
            .filter((point) => point.value !== null);

          return (
            <g key={cohort.activationMonth}>
              <polyline
                fill="none"
                stroke={colour}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.map((point) => `${xFor(point.monthIndex)},${yFor(point.value)}`).join(' ')}
              />
              {points.map((point) => (
                <circle
                  key={point.monthIndex}
                  cx={xFor(point.monthIndex)}
                  cy={yFor(point.value)}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke={colour}
                  strokeWidth="2.5"
                />
              ))}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        {cohorts.map((cohort, cohortIndex) => (
          <span
            key={cohort.activationMonth}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#172033]"
          >
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: LINE_COLOURS[cohortIndex % LINE_COLOURS.length] }}
            />
            <span>
              {cohort.activationMonth} (n={cohort.size})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
