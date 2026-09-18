/* eslint-disable react/prop-types */
import { cn } from "@/lib/utils";

const BrandMark = ({ className }) => (
  <span
    role="img"
    aria-label="GprFlow"
    className={cn("brand-mark inline-block h-8", className)}
  />
);

export default BrandMark;
