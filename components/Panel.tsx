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
        <h2 className="panel__title">{title}</h2>
        {barExtra}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
