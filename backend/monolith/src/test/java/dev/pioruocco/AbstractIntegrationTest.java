package dev.pioruocco;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
public abstract class AbstractIntegrationTest {

    // Singleton container pattern: @Testcontainers/@Container would stop this per subclass while Spring's cached context still points at the dead port.
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:15");

    static {
        POSTGRES.start();
    }
}
