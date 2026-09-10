import type { ReactNode } from "react";

/** The bordered "window" every section sits in, with its dark title bar. */
export function Panel({
  title,
  barExtra,
  children,
  bodyClassName = "panel__body",
}: {
  title: string;
  barExtra?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <div className="panel">
      <div className="panel__bar">
        <span className="panel__title">{title}</span>
        {barExtra}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
