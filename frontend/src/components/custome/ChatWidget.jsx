import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { sendMessage } from "@/Redux/Chat/Action";
import BrandMark from "@/components/custome/BrandMark";
import { cn } from "@/lib/utils";

const ChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((store) => store.chatBot);
  const fullName = useSelector((store) => store.auth.user?.fullName);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const submit = (e) => {
    e.preventDefault();
    const prompt = text.trim();
    if (!prompt || loading) return;
    dispatch(sendMessage({ prompt }));
    setText("");
  };

  return (
    <>
      {open && (
        <section
          aria-label="Assistente crypto"
          className="fixed inset-x-3 bottom-36 z-50 flex h-[60vh] animate-slide-in flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:h-[34rem] md:w-[26rem]"
        >
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <BrandMark className="h-5" />
              <p className="font-heading font-bold">Assistente</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi assistente"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </header>

          <div className="thin-scroll flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm">
              {`Ciao${fullName ? ` ${fullName.split(" ")[0]}` : ""}, chiedimi prezzi, market cap e altro sulle crypto.`}
            </div>
            {messages.map((item, index) => {
              const mine = item.role === "user";
              return (
                <div
                  key={index}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm animate-slide-in",
                    mine
                      ? "self-end rounded-br-sm bg-brand text-white"
                      : "self-start rounded-bl-sm bg-secondary"
                  )}
                >
                  {mine ? item.prompt : item.ans}
                </div>
              );
            })}
            {loading && (
              <div
                className="flex gap-1 self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-3"
                aria-label="L'assistente sta scrivendo"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Scrivi una domanda"
              aria-label="Messaggio"
              className="h-10 flex-1 rounded-xl border bg-primary/5 px-3 text-sm outline-none placeholder:text-subtle focus:border-primary/50 focus:ring-[3px] focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={!text.trim() || loading}
              aria-label="Invia"
              className="btn-brand h-10 w-10 rounded-full p-0"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Chiudi assistente" : "Apri assistente"}
        aria-expanded={open}
        className="btn-brand fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full p-0 shadow-lg md:bottom-6 md:right-6"
      >
        <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </>
  );
};

export default ChatWidget;
