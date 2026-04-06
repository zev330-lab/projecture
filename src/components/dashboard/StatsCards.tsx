interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export default function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/5 bg-navy-light/60 p-5"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-warm-white">{stat.value}</p>
          {stat.change && (
            <p
              className={`mt-1 text-xs font-medium ${
                stat.trend === "up"
                  ? "text-emerald-400"
                  : stat.trend === "down"
                    ? "text-red-400"
                    : "text-slate"
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
