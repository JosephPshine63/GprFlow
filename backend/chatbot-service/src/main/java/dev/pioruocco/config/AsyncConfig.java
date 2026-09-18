package dev.pioruocco.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    // Bounded on purpose: Gemini calls are slow (seconds), so an unbounded
    // pool would just let a burst of requests pile up outstanding sockets.
    @Bean(name = "geminiExecutor")
    Executor geminiExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("gemini-");
        executor.initialize();
        return executor;
    }
}
