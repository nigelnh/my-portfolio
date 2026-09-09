import type { ReactNode } from "react";

/** The bordered "window" every section sits in, with its coloured title bar. */
export function Panel({
  title,
  led,
  barExtra,
  children,
  bodyClassName = "panel__body",
}: {
  title: string;
  led: string;
  barExtra?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="panel">
      <div className="panel__bar">
        <span className="panel__led" style={{ background: led }} />
        <span className="panel__title">{title}</span>
        {barExtra}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
