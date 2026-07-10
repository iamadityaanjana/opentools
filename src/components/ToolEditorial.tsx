import type { ReactNode } from 'react';

export function ToolEditorial({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <div className="tool-editorial">{children}</div>;
}
