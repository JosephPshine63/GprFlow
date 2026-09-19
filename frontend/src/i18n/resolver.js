import { zodResolver } from "@hookform/resolvers/zod";
import i18n from "./index";

// Schemas carry i18n keys as messages; they are translated when the errors are produced.
const translate = (errors) => {
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== "object") continue;
    if (typeof value.message === "string") if (i18n.exists(value.message)) value.message = i18n.t(value.message);
    translate(value);
  }
  return errors;
};

export const i18nResolver = (schema) => {
  const resolve = zodResolver(schema);
  return async (values, context, options) => {
    const result = await resolve(values, context, options);
    translate(result.errors);
    return result;
  };
};
