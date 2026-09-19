package dev.pioruocco.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate = new RestTemplate();

    private final MessageSource messages;

    public EmailService(MessageSource messages) {
        this.messages = messages;
    }

    public void sendVerificationOtpEmail(String userEmail, String otp, Locale locale) throws EmailSendException {
        String subject = messages.getMessage("email.otp.subject", null, locale);
        String html = messages.getMessage("email.otp.body", new Object[]{otp}, locale);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(resendApiKey);

        Map<String, Object> body = Map.of(
                "from", fromEmail,
                "to", List.of(userEmail),
                "subject", subject,
                "html", html
        );

        try {
            restTemplate.postForEntity(RESEND_API_URL, new HttpEntity<>(body, headers), Void.class);
        } catch (RestClientException e) {
            throw new EmailSendException("Failed to send email", e);
        }
    }
}
