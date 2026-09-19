/* eslint-disable react/prop-types */
import { cn } from "@/lib/utils";

const EmptyState = ({ icon: Icon, title, description, children, className }) => (
  <div
    className={cn(
      "flex flex-col items-center px-6 py-12 text-center",
      className
    )}
  >
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
    </span>
    <h2 className="mt-4 text-lg font-semibold">{title}</h2>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    )}
    {children && <div className="mt-5">{children}</div>}
  </div>
);

export default EmptyState;
