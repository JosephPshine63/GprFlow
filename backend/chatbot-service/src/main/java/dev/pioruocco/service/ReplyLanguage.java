package dev.pioruocco.service;

import java.util.Locale;

/**
 * Language the assistant answers in, taken from the caller's Accept-Language.
 * The fixed fallback messages are shown to the user as-is, so they are localized here too.
 */
public enum ReplyLanguage {
    EN("English",
            "The chat assistant isn't configured right now.",
            "Sorry, I couldn't process that right now.",
            "I'm not sure how to answer that.",
            "Which coin did you mean?",
            "I couldn't find market data for \"%s\"."),
    IT("Italian",
            "L'assistente chat non è configurato al momento.",
            "Mi dispiace, al momento non riesco a elaborare la richiesta.",
            "Non so bene come rispondere.",
            "A quale moneta ti riferisci?",
            "Non ho trovato dati di mercato per \"%s\"."),
    FR("French",
            "L'assistant de chat n'est pas configuré pour le moment.",
            "Désolé, je ne peux pas traiter cette demande pour le moment.",
            "Je ne sais pas trop comment répondre.",
            "De quelle cryptomonnaie parlez-vous ?",
            "Je n'ai pas trouvé de données de marché pour \"%s\"."),
    DE("German",
            "Der Chat-Assistent ist derzeit nicht eingerichtet.",
            "Leider kann ich das gerade nicht verarbeiten.",
            "Ich bin nicht sicher, wie ich darauf antworten soll.",
            "Welche Kryptowährung meinen Sie?",
            "Ich konnte keine Marktdaten für \"%s\" finden."),
    ES("Spanish",
            "El asistente de chat no está configurado en este momento.",
            "Lo siento, no puedo procesar eso ahora mismo.",
            "No estoy seguro de cómo responder a eso.",
            "¿A qué criptomoneda te refieres?",
            "No encontré datos de mercado para \"%s\".");

    private final String modelName;
    private final String notConfigured;
    private final String failed;
    private final String unsure;
    private final String whichCoin;
    private final String noMarketData;

    ReplyLanguage(String modelName, String notConfigured, String failed, String unsure,
                  String whichCoin, String noMarketData) {
        this.modelName = modelName;
        this.notConfigured = notConfigured;
        this.failed = failed;
        this.unsure = unsure;
        this.whichCoin = whichCoin;
        this.noMarketData = noMarketData;
    }

    public static ReplyLanguage from(Locale locale) {
        if (locale == null) {
            return EN;
        }
        for (ReplyLanguage language : values()) {
            if (language.name().equalsIgnoreCase(locale.getLanguage())) {
                return language;
            }
        }
        return EN;
    }

    public String modelName() {
        return modelName;
    }

    public String notConfigured() {
        return notConfigured;
    }

    public String failed() {
        return failed;
    }

    public String unsure() {
        return unsure;
    }

    public String whichCoin() {
        return whichCoin;
    }

    public String noMarketData(String coin) {
        return String.format(noMarketData, coin);
    }
}
