// Renders a hand-rolled SVG bar chart of hourly precipitation probability.
// No charting library here on purpose, with ~24 data points and one
// metric, a library is overkill. Each bar's height is just probability
// (0-100%) mapped linearly into the chart's pixel height

const CHART_WIDTH = 900; // matches .hourly-table's max-width so both sections line up
const CHART_HEIGHT = 140;
const LABEL_SPACE = 20; // reserved at the bottom for hour labels
const TOP_PADDING = 14; // reserved at the top so the 100% label doesn't clip against the viewBox edge
const AXIS_WIDTH = 32; // reserved on the left for the probability value axis
const BAR_GAP = 4;
const AXIS_TICKS = [0, 25, 50, 75, 100];

function formatHourLabel(dateString) {
    return new Date(dateString).toLocaleTimeString([], { hour: "numeric" });
}

export default function PrecipitationChart({ hourly }) {
    const barCount = hourly.length;
    const plotWidth = CHART_WIDTH - AXIS_WIDTH;
    // plotBottom is the y-coordinate of the 0% line; plotHeight is the
    // vertical span between 0% and 100%, now inset from the very top of
    // the viewBox by TOP_PADDING so nothing at the 100% mark clips.
    const plotBottom = CHART_HEIGHT - LABEL_SPACE;
    const plotHeight = plotBottom - TOP_PADDING;
    const barWidth = (plotWidth - BAR_GAP * (barCount - 1)) / barCount;

    return (
        <svg
            className="precip-chart"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Hourly precipitation probability"
        >
            {/* Value axis: gridlines + labels for probability, 0-100% */}
            {AXIS_TICKS.map((tick) => {
                const y = plotBottom - (tick / 100) * plotHeight;
                return (
                    <g key={tick}>
                        <line
                            x1={AXIS_WIDTH}
                            y1={y}
                            x2={CHART_WIDTH}
                            y2={y}
                            className={tick === 0 ? "precip-baseline" : "precip-gridline"}
                        />
                        <text
                            x={AXIS_WIDTH - 6}
                            y={y}
                            textAnchor="end"
                            dominantBaseline="middle"
                            className="precip-axis-label"
                        >
                            {tick}%
                        </text>
                    </g>
                );
            })}

            {hourly.map((entry, index) => {
                const barHeight = (entry.precip_probability / 100) * plotHeight;
                const x = AXIS_WIDTH + index * (barWidth + BAR_GAP);
                const y = plotBottom - barHeight;

                return (
                    <g key={entry.date}>
                        <rect x={x} y={y} width={barWidth} height={barHeight} rx={2} className="precip-bar">
                            <title>
                                {`${formatHourLabel(entry.date)}: ${entry.precip_probability}% chance, ${entry.precipitation}mm`}
                            </title>
                        </rect>
                        {index % 3 === 0 && (
                            <text x={x + barWidth / 2} y={CHART_HEIGHT - 4} textAnchor="middle" className="precip-label">
                                {formatHourLabel(entry.date)}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
