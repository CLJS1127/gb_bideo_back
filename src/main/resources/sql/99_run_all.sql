-- ----------------------------------------------------------
-- Bideo 전체 스키마 실행 스크립트
-- 사용법: psql -U bideo -d spring -f 99_run_all.sql
-- ----------------------------------------------------------

\encoding UTF8

-- 1) 독립 테이블 (FK 없음)
\i tbl_member.sql
\i tbl_tag.sql
\i tbl_badge.sql
\i tbl_message_room.sql
\i tbl_faq.sql

-- 2) tbl_member 참조
\i tbl_oauth.sql
\i tbl_member_tag.sql
\i tbl_member_badge.sql
\i tbl_notification_setting.sql
\i tbl_follow.sql
\i tbl_block.sql
\i tbl_card.sql
\i tbl_search_history.sql
\i tbl_inquiry.sql
\i tbl_like.sql
\i tbl_bookmark.sql
\i tbl_hide.sql
\i tbl_report.sql
\i tbl_notification.sql
\i tbl_display_control.sql
\i tbl_curator_setting.sql

-- 3) tbl_member 참조 + 자기참조
\i tbl_comment.sql
\i tbl_comment_like.sql

-- 4) tbl_work 및 관련
\i tbl_work.sql
\i tbl_work_file.sql
\i tbl_work_tag.sql

-- 5) tbl_gallery 관련
\i tbl_gallery.sql
\i tbl_gallery_tag.sql
\i tbl_gallery_work.sql

-- 6) tbl_contest 관련
\i tbl_contest.sql
\i tbl_contest_tag.sql
\i tbl_contest_entry.sql

-- 7) tbl_message 관련
\i tbl_message_room_member.sql
\i tbl_message.sql

-- 8) 경매/결제/정산
\i tbl_auction.sql
\i tbl_bid.sql
\i tbl_auction_wishlist.sql
\i tbl_order.sql
\i tbl_payment.sql
\i tbl_settlement.sql
\i tbl_settlement_deduction.sql
\i tbl_withdrawal_request.sql

-- 9) 시드 데이터
\i seed_badge.sql
