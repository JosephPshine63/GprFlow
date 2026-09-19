// Model replies may carry emoji; the UI keeps them out (see check-no-emoji).
const EMOJI = /\p{Extended_Pictographic}|\u200D|\uFE0F|\u20E3/gu;

export const stripEmoji = (text) =>
  typeof text === "string" ? text.replace(EMOJI, "").replace(/[ \t]{2,}/g, " ").trim() : text;
