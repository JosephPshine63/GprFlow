import { maskAccountNumber } from "@/Util/maskAccountNumber";

export const METHODS = {
  BANK_TRANSFER: "Bonifico bancario",
  CARD: "Carta",
};

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
  new RegExp(`^\\d{${min},${max}}$`).test(value) ? null : `Il numero di conto deve avere da ${min} a ${max} cifre`;

const FORMATS = {
  iban: {
    accountLabel: "IBAN",
    accountPlaceholder: "IT60 X054 2811 1010 0000 0123 456",
    checkAccount: (value, country) => {
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value)) return "IBAN non valido";
      if (country !== "OTHER" && !value.startsWith(country)) return "L'IBAN non corrisponde al paese scelto";
      return ibanChecksumOk(value) ? null : "IBAN non valido, controlla le cifre";
    },
    bic: "optional",
  },
  us: {
    accountLabel: "Numero di conto",
    accountPlaceholder: "000123456789",
    checkAccount: digitsAccount(4, 17),
    code: { label: "Routing number", placeholder: "9 cifre", pattern: /^\d{9}$/, message: "Il routing number ha 9 cifre" },
  },
  gb: {
    accountLabel: "Numero di conto",
    accountPlaceholder: "12345678",
    checkAccount: digitsAccount(8, 8),
    code: { label: "Sort code", placeholder: "12-34-56", pattern: /^\d{6}$/, message: "Il sort code ha 6 cifre" },
  },
  in: {
    accountLabel: "Numero di conto",
    accountPlaceholder: "000000005602",
    checkAccount: digitsAccount(9, 18),
    code: { label: "Codice IFSC", placeholder: "YESB0000001", pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Il codice IFSC ha 11 caratteri" },
  },
  au: {
    accountLabel: "Numero di conto",
    accountPlaceholder: "123456789",
    checkAccount: digitsAccount(6, 9),
    code: { label: "BSB", placeholder: "123-456", pattern: /^\d{6}$/, message: "Il BSB ha 6 cifre" },
  },
  other: {
    accountLabel: "Numero di conto o IBAN",
    accountPlaceholder: "Numero di conto",
    checkAccount: (value) =>
      /^[A-Z0-9]{4,34}$/.test(value) ? null : "Il numero di conto deve avere da 4 a 34 caratteri",
    bic: "required",
  },
};

const EU = [
  ["IT", "Italia"], ["DE", "Germania"], ["FR", "Francia"], ["ES", "Spagna"],
  ["NL", "Paesi Bassi"], ["BE", "Belgio"], ["AT", "Austria"], ["PT", "Portogallo"],
  ["IE", "Irlanda"], ["LU", "Lussemburgo"], ["FI", "Finlandia"], ["GR", "Grecia"],
  ["CH", "Svizzera"],
];

export const COUNTRIES = [
  ...EU.map(([code, label]) => ({ code, label, format: "iban" })),
  { code: "GB", label: "Regno Unito", format: "gb" },
  { code: "US", label: "Stati Uniti", format: "us" },
  { code: "IN", label: "India", format: "in" },
  { code: "AU", label: "Australia", format: "au" },
  { code: "OTHER", label: "Altro paese", format: "other" },
];

export const formatFor = (country) =>
  FORMATS[COUNTRIES.find((c) => c.code === country)?.format ?? "other"];

export const countryLabel = (code) => COUNTRIES.find((c) => c.code === code)?.label ?? code;

const BIC = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

export const BIC_LABEL = "Codice SWIFT/BIC";

// Returns [{ path, message }] for a bank-transfer form; empty when valid.
export function validateBank(data) {
  const format = formatFor(data.country);
  const issues = [];
  const account = strip(data.accountNumber);
  const code = strip(data.bankCode);
  const bic = strip(data.swiftBic);

  if (!data.bankName.trim()) issues.push({ path: "bankName", message: "Inserisci il nome della banca" });

  const accountProblem = account ? format.checkAccount(account, data.country) : `Inserisci ${format.accountLabel === "IBAN" ? "l'IBAN" : "il numero di conto"}`;
  if (accountProblem) issues.push({ path: "accountNumber", message: accountProblem });
  else if (account !== strip(data.confirmAccountNumber)) {
    issues.push({ path: "confirmAccountNumber", message: "I valori non coincidono" });
  }

  if (format.code) {
    if (!code) issues.push({ path: "bankCode", message: `Inserisci ${format.code.label}` });
    else if (!format.code.pattern.test(code)) issues.push({ path: "bankCode", message: format.code.message });
  }

  if (format.bic === "required" && !bic) {
    issues.push({ path: "swiftBic", message: "Per questo paese serve il codice SWIFT/BIC" });
  } else if (bic && !BIC.test(bic)) {
    issues.push({ path: "swiftBic", message: "Codice SWIFT/BIC non valido" });
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
  return "Carta";
}

export function validateCard(data) {
  const digits = cardDigits(data.cardNumber);
  if (!/^\d{13,19}$/.test(digits) || !luhnOk(digits)) {
    return [{ path: "cardNumber", message: "Numero di carta non valido" }];
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
      title: details.cardBrand,
      masked: `**** ${details.cardLast4}`,
      rows: [
        ["Metodo", METHODS.CARD],
        ["Intestatario", details.accountHolderName],
        ["Carta", `${details.cardBrand} **** ${details.cardLast4}`],
      ],
    };
  }
  const format = formatFor(details.country);
  const legacyIfsc = !details.bankCode && details.ifsc;
  const code = details.bankCode ?? details.ifsc;
  const codeLabel = legacyIfsc ? "Codice IFSC" : format.code?.label;
  return {
    method,
    title: details.bankName,
    masked: maskAccountNumber(details.accountNumber ?? ""),
    rows: [
      ["Metodo", METHODS.BANK_TRANSFER],
      ...(details.country ? [["Paese", countryLabel(details.country)]] : []),
      ["Intestatario", details.accountHolderName],
      [details.country ? format.accountLabel : "Numero di conto", maskAccountNumber(details.accountNumber ?? "")],
      ...(code ? [[codeLabel ?? "Codice banca", code.toUpperCase()]] : []),
      ...(details.swiftBic ? [[BIC_LABEL, details.swiftBic]] : []),
    ],
  };
}
