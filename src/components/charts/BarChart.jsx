import './BarChart.scss'

// Palette mirrors styles/abstracts/_variables.scss — kept in sync manually
// since SCSS variables aren't reachable from JS without an extra build step.
const COLORS = ['#6d5ef8', '#22a06b', '#c9a257', '#4a80d9', '#d1554f', '#9791b3']

export function BarChart({ data = [], height = 28 }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className="bar-chart">
      {data.map((item, index) => (
        <div key={item.label} className="bar-chart__row">
          <span className="bar-chart__label">{item.label}</span>
          <div className="bar-chart__track" style={{ height }}>
            <div
              className="bar-chart__fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color || COLORS[index % COLORS.length],
              }}
            />
          </div>
          <span className="bar-chart__value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
