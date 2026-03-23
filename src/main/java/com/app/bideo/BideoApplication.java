package com.app.bideo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.session.SessionAutoConfiguration;

@SpringBootApplication(exclude = SessionAutoConfiguration.class)
public class BideoApplication {

    public static void main(String[] args) {
        SpringApplication.run(BideoApplication.class, args);
    }
}
