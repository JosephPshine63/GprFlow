package dev.pioruocco.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import dev.pioruocco.service.ReplyLanguage;

@Component
public class GeminiClient {

    public static final String COIN_TOOL_NAME = "getCoinDetails";

    // Keeps the bot scoped to GprFlow's own domain instead of acting as a
    // general-purpose assistant once it's reachable over a public endpoint.
    private static final String SYSTEM_INSTRUCTION =
            "You are the GprFlow assistant, embedded in a cryptocurrency trading platform. " +
            "Only answer questions about cryptocurrency prices, market data, and how to use GprFlow. " +
            "Use the getCoinDetails function whenever the user asks about a specific coin's price or " +
            "market data. Politely decline anything unrelated to crypto or GprFlow.";

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.6-flash}")
    private String model;

    public GeminiClient(RestClient externalApiRestClient, ObjectMapper objectMapper) {
        this.restClient = externalApiRestClient;
        this.objectMapper = objectMapper;
    }

    public boolean isEnabled() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.equals("your gemini api key");
    }

    public JsonNode generateSimple(String prompt, ReplyLanguage language) {
        ObjectNode body = objectMapper.createObjectNode();
        setSystemInstruction(body, language);
        ArrayNode contents = body.putArray("contents");
        contents.add(userTurn(prompt));
        return call(body);
    }

    public JsonNode generateInitial(String prompt, ReplyLanguage language) {
        ObjectNode body = objectMapper.createObjectNode();
        setSystemInstruction(body, language);
        ArrayNode contents = body.putArray("contents");
        contents.add(userTurn(prompt));
        body.set("tools", coinToolDeclaration());
        return call(body);
    }

    public JsonNode generateWithFunctionResult(String prompt, ReplyLanguage language, String functionName,
                                                JsonNode functionArgs, JsonNode functionResultContent) {
        ObjectNode body = objectMapper.createObjectNode();
        setSystemInstruction(body, language);

        ArrayNode contents = body.putArray("contents");
        contents.add(userTurn(prompt));

        ObjectNode modelTurn = objectMapper.createObjectNode();
        modelTurn.put("role", "model");
        ObjectNode functionCallPart = modelTurn.putArray("parts").addObject();
        ObjectNode functionCall = functionCallPart.putObject("functionCall");
        functionCall.put("name", functionName);
        functionCall.set("args", functionArgs);
        contents.add(modelTurn);

        ObjectNode functionTurn = objectMapper.createObjectNode();
        functionTurn.put("role", "function");
        ObjectNode functionResponsePart = functionTurn.putArray("parts").addObject();
        ObjectNode functionResponse = functionResponsePart.putObject("functionResponse");
        functionResponse.put("name", functionName);
        ObjectNode responseWrapper = functionResponse.putObject("response");
        responseWrapper.put("name", functionName);
        responseWrapper.set("content", functionResultContent);
        contents.add(functionTurn);

        body.set("tools", coinToolDeclaration());
        return call(body);
    }

    public String extractText(JsonNode response) {
        return response.at("/candidates/0/content/parts/0/text").asText(null);
    }

    public JsonNode extractFunctionCall(JsonNode response) {
        JsonNode functionCall = response.at("/candidates/0/content/parts/0/functionCall");
        return functionCall.isMissingNode() ? null : functionCall;
    }

    private void setSystemInstruction(ObjectNode body, ReplyLanguage language) {
        ObjectNode systemInstruction = body.putObject("systemInstruction");
        systemInstruction.putArray("parts").addObject().put("text", SYSTEM_INSTRUCTION + " Always reply in " + language.modelName() + ".");
    }

    private ObjectNode userTurn(String prompt) {
        ObjectNode content = objectMapper.createObjectNode();
        content.put("role", "user");
        content.putArray("parts").addObject().put("text", prompt);
        return content;
    }

    private ArrayNode coinToolDeclaration() {
        ArrayNode tools = objectMapper.createArrayNode();
        ObjectNode tool = tools.addObject();
        ArrayNode functionDeclarations = tool.putArray("functionDeclarations");
        ObjectNode fn = functionDeclarations.addObject();
        fn.put("name", COIN_TOOL_NAME);
        fn.put("description", "Get live price and market data for a cryptocurrency traded on GprFlow.");
        ObjectNode parameters = fn.putObject("parameters");
        parameters.put("type", "OBJECT");
        ObjectNode properties = parameters.putObject("properties");
        ObjectNode currencyName = properties.putObject("currencyName");
        currencyName.put("type", "STRING");
        currencyName.put("description", "The coin's CoinGecko id, symbol, or name, e.g. bitcoin.");
        parameters.putArray("required").add("currencyName");
        return tools;
    }

    private JsonNode call(ObjectNode body) {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                + model + ":generateContent?key=" + apiKey;

        String response = restClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body.toString())
                .retrieve()
                .body(String.class);

        try {
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new GeminiException("Failed to parse Gemini response", e);
        }
    }
}
