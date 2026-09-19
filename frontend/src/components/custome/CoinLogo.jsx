/* eslint-disable react/prop-types */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const CoinLogo = ({ src, symbol, className }) => (
  <Avatar className={cn("h-8 w-8", className)}>
    <AvatarImage src={src} alt={symbol} />
    <AvatarFallback className="bg-secondary text-[10px] font-semibold uppercase">
      {(symbol || "?").slice(0, 3)}
    </AvatarFallback>
  </Avatar>
);

export default CoinLogo;
