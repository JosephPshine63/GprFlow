import i18n, { currentLocale } from "@/i18n";
import { maskAccountNumber } from "@/Util/maskAccountNumber";

const t = (key, params) => i18n.t(key, params);

export const METHOD_KEYS = ["BANK_TRANSFER", "CARD"];

export const methodLabel = (method) => t(`payout.methods.${method}`);

const strip = (value) => value.replace(/[\s-]/g, "").toUpperCase();

// mod-97 check from ISO 13616; catches nearly every typo
const ibanChecksumOk = (iban) => {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const digits = ch >= "A" ? String(ch.charCodeAt(0) - 55) : ch;
    for (const d of digits) remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
};

const digitsAccount = (min, max) => (value) =>
  new RegExp(`^\\d{${min},${max}}$`).test(value) ? null : t("payout.errors.accountDigits", { min, max });

const FORMATS = {
  iban: {
    isIban: true,
    accountLabel: "IBAN",
    accountPlaceholder: "IT60 X054 2811 1010 0000 0123 456",
    checkAccount: (value, country) => {
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value)) return t("payout.errors.ibanInvalid");
      if (country !== "OTHER" && !value.startsWith(country)) return t("payout.errors.ibanCountry");
      return ibanChecksumOk(value) ? null : t("payout.errors.ibanChecksum");
    },
    bic: "optional",
  },
  us: {
    get accountLabel() {
      return t("payout.accountNumber");
    },
    accountPlaceholder: "000123456789",
    checkAccount: digitsAccount(4, 17),
    code: {
      label: "Routing number",
      get placeholder() {
        return t("payout.digitsPlaceholder");
      },
      pattern: /^\d{9}$/,
      get message() {
        return t("payout.errors.routing");
      },
    },
  },
  gb: {
    get accountLabel() {
      return t("payout.accountNumber");
    },
    accountPlaceholder: "12345678",
    checkAccount: digitsAccount(8, 8),
    code: {
      label: "Sort code",
      placeholder: "12-34-56",
      pattern: /^\d{6}$/,
      get message() {
        return t("payout.errors.sortCode");
      },
    },
  },
  in: {
    get accountLabel() {
      return t("payout.accountNumber");
    },
    accountPlaceholder: "000000005602",
    checkAccount: digitsAccount(9, 18),
    code: {
      get label() {
        return t("payout.ifscCode");
      },
      placeholder: "YESB0000001",
      pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      get message() {
        return t("payout.errors.ifsc");
      },
    },
  },
  au: {
    get accountLabel() {
      return t("payout.accountNumber");
    },
    accountPlaceholder: "123456789",
    checkAccount: digitsAccount(6, 9),
    code: {
      label: "BSB",
      placeholder: "123-456",
      pattern: /^\d{6}$/,
      get message() {
        return t("payout.errors.bsb");
      },
    },
  },
  other: {
    get accountLabel() {
      return t("payout.accountNumberOrIban");
    },
    get accountPlaceholder() {
      return t("payout.accountPlaceholderOther");
    },
    checkAccount: (value) =>
      /^[A-Z0-9]{4,34}$/.test(value) ? null : t("payout.errors.accountLength"),
    bic: "required",
  },
};

const EU = ["IT", "DE", "FR", "ES", "NL", "BE", "AT", "PT", "IE", "LU", "FI", "GR", "CH"];

// Country names come from the browser's own locale data instead of the catalog.
export const countryLabel = (code) => {
  if (code === "OTHER") return t("payout.otherCountry");
  try {
    return new Intl.DisplayNames([currentLocale()], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
};

const country = (code, format) => ({
  code,
  format,
  get label() {
    return countryLabel(code);
  },
});

export const COUNTRIES = [
  ...EU.map((code) => country(code, "iban")),
  country("GB", "gb"),
  country("US", "us"),
  country("IN", "in"),
  country("AU", "au"),
  country("OTHER", "other"),
];

export const formatFor = (country) =>
  FORMATS[COUNTRIES.find((c) => c.code === country)?.format ?? "other"];

const BIC = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const bicLabel = () => t("payout.bic");

// Returns [{ path, message }] for a bank-transfer form; empty when valid.
export function validateBank(data) {
  const format = formatFor(data.country);
  const issues = [];
  const account = strip(data.accountNumber);
  const code = strip(data.bankCode);
  const bic = strip(data.swiftBic);

  if (!data.bankName.trim()) issues.push({ path: "bankName", message: t("payout.errors.bankRequired") });

  const accountProblem = account ? format.checkAccount(account, data.country) : t(format.isIban ? "payout.errors.enterIban" : "payout.errors.enterAccount");
  if (accountProblem) issues.push({ path: "accountNumber", message: accountProblem });
  else if (account !== strip(data.confirmAccountNumber)) {
    issues.push({ path: "confirmAccountNumber", message: t("payout.errors.mismatch") });
  }

  if (format.code) {
    if (!code) issues.push({ path: "bankCode", message: t("payout.errors.enterCode", { label: format.code.label }) });
    else if (!format.code.pattern.test(code)) issues.push({ path: "bankCode", message: format.code.message });
  }

  if (format.bic === "required" && !bic) {
    issues.push({ path: "swiftBic", message: t("payout.errors.bicRequired") });
  } else if (bic && !BIC.test(bic)) {
    issues.push({ path: "swiftBic", message: t("payout.errors.bicInvalid") });
  }
  return issues;
}

const luhnOk = (digits) => {
  let sum = 0;
  [...digits].reverse().forEach((ch, i) => {
    let n = Number(ch);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
};

export const cardDigits = (value) => value.replace(/[\s-]/g, "");

export function cardBrand(digits) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  return "Card";
}

// Rows saved before the catalog existed store the generic brand as "Carta".
const brandLabel = (brand) => (!brand || brand === "Card" || brand === "Carta" ? methodLabel("CARD") : brand);

export function validateCard(data) {
  const digits = cardDigits(data.cardNumber);
  if (!/^\d{13,19}$/.test(digits) || !luhnOk(digits)) {
    return [{ path: "cardNumber", message: t("payout.errors.cardInvalid") }];
  }
  return [];
}

// Only these leave the browser: the full card number is never sent or stored.
export function buildPayload(data) {
  const holder = data.accountHolderName.trim();
  if (data.method === "CARD") {
    const digits = cardDigits(data.cardNumber);
    return { method: "CARD", accountHolderName: holder, cardBrand: cardBrand(digits), cardLast4: digits.slice(-4) };
  }
  const payload = {
    method: "BANK_TRANSFER",
    country: data.country,
    accountHolderName: holder,
    bankName: data.bankName.trim(),
    accountNumber: strip(data.accountNumber),
  };
  if (strip(data.bankCode)) payload.bankCode = strip(data.bankCode);
  if (strip(data.swiftBic)) payload.swiftBic = strip(data.swiftBic);
  return payload;
}

// Shape shared by the payment details page and the withdraw dialog. Rows saved
// before payout methods existed have no method/country and may only carry an IFSC.
export function describePayout(details) {
  const method = details.method ?? "BANK_TRANSFER";
  if (method === "CARD") {
    return {
      method,
      title: brandLabel(details.cardBrand),
      masked: `**** ${details.cardLast4}`,
      rows: [
        [t("payout.rows.method"), methodLabel("CARD")],
        [t("payout.rows.holder"), details.accountHolderName],
        [t("payout.rows.card"), `${brandLabel(details.cardBrand)} **** ${details.cardLast4}`],
      ],
    };
  }
  const format = formatFor(details.country);
  const legacyIfsc = !details.bankCode && details.ifsc;
  const code = details.bankCode ?? details.ifsc;
  const codeLabel = legacyIfsc ? t("payout.ifscCode") : format.code?.label;
  return {
    method,
    title: details.bankName,
    masked: maskAccountNumber(details.accountNumber ?? ""),
    rows: [
      [t("payout.rows.method"), methodLabel("BANK_TRANSFER")],
      ...(details.country ? [[t("payout.rows.country"), countryLabel(details.country)]] : []),
      [t("payout.rows.holder"), details.accountHolderName],
      [details.country ? format.accountLabel : t("payout.accountNumber"), maskAccountNumber(details.accountNumber ?? "")],
      ...(code ? [[codeLabel ?? t("payout.bankCode"), code.toUpperCase()]] : []),
      ...(details.swiftBic ? [[bicLabel(), details.swiftBic]] : []),
    ],
  };
}
