package com.app;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class SqlSchemaConsistencyTest {

    @Test
    void bideoDomainSchemaIncludesOrderSupport() throws IOException {
        String runAll = readResource("sql/99_run_all.sql");

        assertTrue(runAll.contains("\\i tbl_order.sql"));
    }

    @Test
    void workAndContestSchemasStoreBideoCategoryLicenseAndLongDescriptions() throws IOException {
        String work = readResource("sql/tbl_work.sql");
        String contest = readResource("sql/tbl_contest.sql");
        String gallery = readResource("sql/tbl_gallery.sql");

        assertTrue(work.contains("category"));
        assertTrue(work.contains("license_type"));
        assertTrue(work.contains("description   text"));
        assertTrue(gallery.contains("description   text"));
        assertTrue(contest.contains("description text"));
        assertTrue(contest.contains("category"));
        assertFalse(contest.contains("region"));
    }

    @Test
    void memberBookmarkAndNotificationSchemasMatchBideoProfileAndContestFeatures() throws IOException {
        String member = readResource("sql/tbl_member.sql");
        String bookmark = readResource("sql/tbl_bookmark.sql");
        String notificationSetting = readResource("sql/tbl_notification_setting.sql");

        assertTrue(member.contains("creator_verified"));
        assertTrue(member.contains("seller_verified"));
        assertTrue(member.contains("creator_tier"));
        assertTrue(bookmark.contains("WORK / GALLERY / CONTEST"));
        assertTrue(notificationSetting.contains("follow_notify"));
        assertTrue(notificationSetting.contains("like_bookmark_notify"));
        assertTrue(notificationSetting.contains("comment_mention_notify"));
        assertTrue(notificationSetting.contains("auction_notify"));
        assertTrue(notificationSetting.contains("payment_settlement_notify"));
        assertTrue(notificationSetting.contains("contest_notify"));
    }

    @Test
    void memberSchemaIncludesPhoneStatusAndLastLogin() throws IOException {
        String member = readResource("sql/tbl_member.sql");

        assertTrue(member.contains("phone_number"), "tbl_member should have phone_number column");
        assertTrue(member.contains("last_login_datetime"), "tbl_member should have last_login_datetime column");
        assertTrue(member.contains("status"), "tbl_member should have status column");
        assertTrue(member.contains("ACTIVE"), "tbl_member status should include ACTIVE");
        assertTrue(member.contains("SUSPENDED"), "tbl_member status should include SUSPENDED");
        assertTrue(member.contains("BANNED"), "tbl_member status should include BANNED");
    }

    @Test
    void curatorSettingSchemaIncludesCuratorInfo() throws IOException {
        String curator = readResource("sql/tbl_curator_setting.sql");

        assertTrue(curator.contains("curator_name"), "tbl_curator_setting should have curator_name column");
        assertTrue(curator.contains("theme_title"), "tbl_curator_setting should have theme_title column");
        assertTrue(curator.contains("intro"), "tbl_curator_setting should have intro column");
    }

    @Test
    void displayControlSchemaIncludesBlockTypeAndEndDatetime() throws IOException {
        String dc = readResource("sql/tbl_display_control.sql");

        assertTrue(dc.contains("block_type"), "tbl_display_control should have block_type column");
        assertTrue(dc.contains("end_datetime"), "tbl_display_control should have end_datetime column");
        assertTrue(dc.contains("PERMANENT"), "block_type should include PERMANENT");
        assertTrue(dc.contains("PERIOD"), "block_type should include PERIOD");
        assertTrue(dc.contains("TEMPORARY"), "block_type should include TEMPORARY");
    }

    @Test
    void withdrawalRequestTableExistsAndIsIncludedInRunAll() throws IOException {
        String runAll = readResource("sql/99_run_all.sql");
        String wr = readResource("sql/tbl_withdrawal_request.sql");

        assertTrue(runAll.contains("\\i tbl_withdrawal_request.sql"), "99_run_all.sql should include tbl_withdrawal_request.sql");
        assertTrue(wr.contains("withdrawal_code"), "tbl_withdrawal_request should have withdrawal_code column");
        assertTrue(wr.contains("requested_amount"), "tbl_withdrawal_request should have requested_amount column");
        assertTrue(wr.contains("net_amount"), "tbl_withdrawal_request should have net_amount column");
        assertTrue(wr.contains("fk_wr_member"), "tbl_withdrawal_request should have member FK");
        assertTrue(wr.contains("fk_wr_settlement"), "tbl_withdrawal_request should have settlement FK");
    }

    @Test
    void paymentAndAuctionSchemasSupportBideoTransactionLifecycle() throws IOException {
        String auction = readResource("sql/tbl_auction.sql");
        String order = readResource("sql/tbl_order.sql");
        String payment = readResource("sql/tbl_payment.sql");

        assertTrue(auction.contains("cancel_threshold  double precision"));
        assertTrue(order.contains("deposit_amount"));
        assertTrue(order.contains("license_type"));
        assertTrue(order.contains("balance_due_at"));
        assertTrue(payment.contains("payment_purpose"));
        assertTrue(payment.contains("fk_payment_order_code"));
    }

    private String readResource(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream stream = resource.getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
