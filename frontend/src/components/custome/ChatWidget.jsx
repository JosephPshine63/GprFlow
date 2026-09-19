import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUp, Github, Globe, Linkedin, Mail, MessageCircle, X } from "lucide-react";
import { sendMessage } from "@/Redux/Chat/Action";
import BrandMark from "@/components/custome/BrandMark";
import { cn } from "@/lib/utils";
import { DEVELOPER } from "@/Util/contacts";

const LINK_ICONS = { github: Github, linkedin: Linkedin, email: Mail, portfolio: Globe };

const Contacts = () => (
  <ul className="mt-3 flex flex-wrap gap-2">
    {DEVELOPER.links
      .filter((link) => link.url)
      .map(({ key, label, url }) => {
        const Icon = LINK_ICONS[key];
        return (
          <li key={key}>
            <a
              href={url}
              {...(url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-1.5 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </a>
          </li>
        );
      })}
  </ul>
);

const ChatWidget = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((store) => store.chatBot);
  const fullName = useSelector((store) => store.auth.user?.fullName);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  // The greeting counts as one unread message until the panel is opened for the first time.
  const replies = messages.filter((m) => m.role === "model").length;
  const [seen, setSeen] = useState({ greeting: false, replies: 0 });
  const unread = (seen.greeting ? 0 : 1) + replies - seen.replies;

  useEffect(() => {
    if (open) setSeen({ greeting: true, replies });
  }, [open, replies]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, error, open]);

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
          aria-label={t("chat.label")}
          className="fixed inset-x-3 bottom-36 z-50 flex h-[60vh] animate-slide-in flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl md:inset-x-auto md:bottom-24 md:right-6 md:h-[34rem] md:w-[26rem]"
        >
          <header className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <BrandMark className="h-5" />
              <p className="font-heading font-bold">{t("chat.title")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("chat.close")}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </header>

          <div className="thin-scroll flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm">
              <p>
                {fullName
                  ? t("chat.greetingNamed", { name: fullName.split(" ")[0] })
                  : t("chat.greeting")}
              </p>
              <p className="mt-3 text-muted-foreground">
                {t("chat.about", { developer: DEVELOPER.name })}
              </p>
              <Contacts />
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
                aria-label={t("chat.typing")}
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
            {error && !loading && (
              <div
                role="alert"
                className="max-w-[85%] self-start rounded-2xl rounded-bl-sm border border-down/30 bg-down/10 px-4 py-2.5 text-sm text-down"
              >
                {t("chat.error")}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.message")}
              className="h-10 flex-1 rounded-xl border bg-primary/5 px-3 text-sm outline-none placeholder:text-subtle focus:border-primary/50 focus:ring-[3px] focus:ring-primary/10"
            />
            <button
              type="submit"
              disabled={!text.trim() || loading}
              aria-label={t("chat.send")}
              className="btn-brand h-10 w-10 rounded-full p-0"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </section>
      )}

      <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={
            open
              ? t("chat.close")
              : unread > 0
                ? t("chat.openUnread", { count: unread })
                : t("chat.open")
          }
          aria-expanded={open}
          className="btn-brand h-12 w-12 rounded-full p-0 shadow-lg"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
        </button>
        {!open && unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pop-in items-center justify-center rounded-full bg-down px-1 text-[11px] font-bold leading-none text-background"
          >
            {unread}
          </span>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
