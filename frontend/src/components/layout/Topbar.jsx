import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Search, ShieldCheck, User } from "lucide-react";
import { logout } from "@/Redux/Auth/Action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BrandMark from "@/components/custome/BrandMark";
import ThemeToggle from "@/components/custome/ThemeToggle";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((store) => store.auth.user);
  const initial = (user?.fullName || user?.email || "?").charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Link to="/" className="md:hidden" aria-label="GprFlow">
        <BrandMark className="h-7" />
      </Link>

      <Button
        variant="outline"
        onClick={() => navigate("/search")}
        className="ml-auto h-10 w-10 justify-center gap-2 rounded-xl px-0 text-muted-foreground md:ml-0 md:w-72 md:justify-start md:px-3 lg:w-96"
        aria-label="Cerca una moneta"
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden text-sm font-normal md:inline">
          Cerca una moneta
        </span>
      </Button>

      <div className="flex items-center gap-1 md:ml-auto">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full"
              aria-label="Menu utente"
              type="button"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-brand text-sm font-semibold text-white">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-semibold">{user?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Profilo
            </DropdownMenuItem>
            {user?.role === "ROLE_ADMIN" && (
              <DropdownMenuItem onClick={() => navigate("/admin/withdrawal")}>
                <ShieldCheck className="mr-2 h-4 w-4" strokeWidth={1.75} />
                Admin prelievi
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" strokeWidth={1.75} />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;
