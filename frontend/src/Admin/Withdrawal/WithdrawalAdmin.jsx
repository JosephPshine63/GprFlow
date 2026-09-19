/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Check, ChevronDown, Inbox, Loader2, X } from "lucide-react";
import { getAllWithdrawalRequest, proceedWithdrawal } from "@/Redux/Withdrawal/Action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import Chip from "@/components/custome/Chip";
import EmptyState from "@/components/custome/EmptyState";
import StatusBadge from "@/components/custome/StatusBadge";
import { formatCurrency, formatDateTime } from "@/Util/format";

const FILTERS = [
  { key: "ALL", label: "Tutte" },
  { key: "PENDING", label: "In attesa" },
  { key: "SUCCESS", label: "Completate" },
  { key: "DECLINE", label: "Rifiutate" },
];

const RequestActions = ({ item, busy, onProceed }) => {
  if (item.status !== "PENDING") return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={busy}>
        <button type="button" className="btn-brand h-9 px-3 text-xs">
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              Gestisci
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="gap-2 text-up" onSelect={() => onProceed(item, true)}>
          <Check className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Accetta
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-down" onSelect={() => onProceed(item, false)}>
          <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Rifiuta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const UserCell = ({ user }) => (
  <div className="min-w-0">
    <p className="truncate font-medium">{user?.fullName || "-"}</p>
    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
  </div>
);

const WithdrawalAdmin = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { requests, loading, error } = useSelector((store) => store.withdrawal);
  const [filter, setFilter] = useState("PENDING");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(getAllWithdrawalRequest());
  }, [dispatch]);

  const rows = useMemo(
    () => [...(requests ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [requests]
  );
  const pending = rows.filter((r) => r.status === "PENDING").length;
  const visible = filter === "ALL" ? rows : rows.filter((r) => r.status === filter);

  const handleProceed = async (item, accept) => {
    setBusyId(item.id);
    try {
      await dispatch(proceedWithdrawal({ id: item.id, accept }));
      toast({ title: accept ? "Prelievo accettato" : "Prelievo rifiutato" });
    } catch (err) {
      toast({ title: "Operazione non riuscita", description: err.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Richieste di prelievo</h1>
        <p className="text-sm text-muted-foreground">
          {pending === 0
            ? "Nessuna richiesta in attesa."
            : `${pending} ${pending === 1 ? "richiesta in attesa" : "richieste in attesa"}.`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtra per stato">
        {FILTERS.map(({ key, label }) => (
          <Chip key={key} active={filter === key} onClick={() => setFilter(key)}>
            {label}
          </Chip>
        ))}
      </div>

      {rows.length === 0 && loading ? (
        <div className="surface space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 && error ? (
        <div className="surface">
          <EmptyState icon={AlertCircle} title="Impossibile caricare le richieste" description={error}>
            <button
              type="button"
              onClick={() => dispatch(getAllWithdrawalRequest())}
              className="btn-brand h-11"
            >
              Riprova
            </button>
          </EmptyState>
        </div>
      ) : visible.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={Inbox}
            title="Nessuna richiesta"
            description={
              filter === "ALL"
                ? "Le richieste di prelievo degli utenti compariranno qui."
                : "Nessuna richiesta con questo stato."
            }
          />
        </div>
      ) : (
        <>
          <div className="surface hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-4">Data</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead className="text-right">Stato</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap py-4">
                      {formatDateTime(item.date)}
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      <UserCell user={item.user} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(Number(item.amount))}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <RequestActions
                        item={item}
                        busy={busyId === item.id}
                        onProceed={handleProceed}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {visible.map((item) => (
              <li key={item.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <UserCell user={item.user} />
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatCurrency(Number(item.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.date)}</p>
                  </div>
                  <RequestActions
                    item={item}
                    busy={busyId === item.id}
                    onProceed={handleProceed}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default WithdrawalAdmin;
