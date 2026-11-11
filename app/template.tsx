/**
 * Soft route enter — layout stays mounted; only the page slot fades in.
 * Softens the “double main” feel after dropping the root loading.tsx.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter flex min-h-0 flex-1 flex-col">{children}</div>;
}
