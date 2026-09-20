/* eslint-disable react/prop-types */
import { Check, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, setLanguage } from "@/i18n";

const LanguageSwitcher = ({ className, onSelect = setLanguage }) => {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label={t("language.change")}
        >
          <Languages className="h-5 w-5" strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl">
        {LANGUAGES.map(({ code, label }) => (
          <DropdownMenuItem key={code} onClick={() => onSelect(code)}>
            <span className="flex-1">{label}</span>
            {i18n.language === code && <Check className="h-4 w-4" strokeWidth={1.75} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
