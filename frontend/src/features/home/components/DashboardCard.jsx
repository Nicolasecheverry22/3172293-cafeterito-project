// Contenedor común de las tarjetas del tablero (BEM: dashboard-card). Cada tarjeta es una
// <section> con aria-labelledby. spanMd / spanLg los calcula HomePage según el layout.
export default function DashboardCard({
  id,
  title,
  icon: Icon,
  badge,
  action,
  spanMd = 1,
  spanLg = 12,
  className = "",
  children,
}) {
  const titleId = `${id}-title`;
  return (
    <section
      id={id}
      className={`dashboard-card ${className}`}
      aria-labelledby={titleId}
      style={{ "--span-md": spanMd, "--span-lg": spanLg }}
    >
      <header className="dashboard-card__header">
        <h2 id={titleId} className="dashboard-card__title">
          {Icon && <Icon className="dashboard-card__icon" aria-hidden="true" />}
          {title}
          {badge != null && <span className="dashboard-card__badge">{badge}</span>}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

// Estado vacío amable (siempre con texto, el icono es decorativo)
export function DashboardEmpty({ icon: Icon, children }) {
  return (
    <div className="dashboard-card__empty">
      {Icon && <Icon aria-hidden="true" />}
      <p>{children}</p>
    </div>
  );
}

// Skeleton mientras llega la primera respuesta (no "Cargando...")
export function DashboardSkeleton() {
  const block = (h, span) => (
    <div className="dashboard-card" style={{ "--span-md": span >= 8 ? 2 : 1, "--span-lg": span }} aria-hidden="true">
      <div className="dashboard-skeleton" style={{ height: 22, width: "40%" }} />
      <div className="dashboard-skeleton" style={{ height: h }} />
    </div>
  );
  return (
    <div className="dashboard" aria-busy="true">
      <span className="sr-only" role="status">Cargando el tablero…</span>
      <div className="dashboard__header" aria-hidden="true">
        <div className="dashboard__greeting">
          <div className="dashboard-skeleton" style={{ width: 56, height: 56, borderRadius: "9999px" }} />
          <div style={{ flex: 1 }}>
            <div className="dashboard-skeleton" style={{ height: 24, width: "60%", marginBottom: 8 }} />
            <div className="dashboard-skeleton" style={{ height: 14, width: "35%" }} />
          </div>
        </div>
        <div className="dashboard-skeleton" style={{ height: 48, width: "min(100%, 420px)" }} />
      </div>
      <div className="dashboard__grid">
        {block(96, 12)}
        {block(260, 8)}
        {block(260, 4)}
        {block(200, 8)}
        {block(200, 4)}
      </div>
    </div>
  );
}
