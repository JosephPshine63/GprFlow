import { Link } from "react-router-dom";
import BrandMark from "@/components/custome/BrandMark";

const Notfound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <BrandMark className="h-10" />
    <p className="mt-8 bg-brand bg-clip-text font-heading text-7xl font-bold text-transparent">
      404
    </p>
    <h1 className="mt-2 text-2xl font-semibold">Pagina non trovata</h1>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
      L&apos;indirizzo non esiste o la pagina è stata spostata.
    </p>
    <Link to="/" className="btn-brand mt-6 h-11 px-6">
      Torna alla Home
    </Link>
  </div>
);

export default Notfound;
