-- ============================================================
-- LEGACY REFERENCE ONLY - MySQL draft DDL
-- Canonical executable schema for this project is the PostgreSQL
-- split DDL under tbl_*.sql plus 99_run_all.sql.
-- ============================================================

-- (1/49) tbl_auction
create table tbl_auction (
    id               bigint generated always as identity primary key,
    work_id          bigint        not null comment '작품 FK',
    seller_id        bigint        not null comment '판매자(등록자) FK',
    asking_price     decimal(15,2) not null comment '판매 희망가',
    starting_price   decimal(15,2) not null comment '시작가',
    estimate_low     decimal(15,2) null     comment '추정가 하한',
    estimate_high    decimal(15,2) null     comment '추정가 상한',
    bid_increment    decimal(15,2) not null default 10000 comment '호가 단위',
    current_price    decimal(15,2) null     comment '현재 최고가',
    bid_count        int           not null default 0 comment '입찰 횟수 (비정규화)',
    fee_rate         decimal(5,4)  not null default 0.0935 comment '수수료율 (9.35%)',
    fee_amount       decimal(15,2) not null comment '수수료 금액',
    settlement_amount decimal(15,2) not null comment '정산 금액 (희망가 - 수수료)',
    deadline_hours   int           not null comment '마감기한 (시간 단위)',
    started_at       datetime      not null default now() comment '경매 시작 시각',
    closing_at       datetime      not null comment '경매 마감 시각',
    cancel_threshold decimal(5,2)  not null default 0.70 comment '취소 불가 기준 (70%)',
    status           varchar(255)   not null default 'ACTIVE' comment '상태 (ACTIVE/CLOSED/SOLD/CANCELLED)',
    winner_id        bigint        null     comment '낙찰자 FK',
    final_price      decimal(15,2) null     comment '낙찰가',
    created_datetime       datetime      not null default now(),
    updated_datetime       datetime      not null default now() on update current_timestamp,
    key idx_auction_work         (work_id),
    key idx_auction_seller       (seller_id),
    key idx_auction_status       (status, closing_at),
    key idx_auction_closing      (closing_at),
    constraint fk_auction_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_auction_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_auction_winner foreign key (winner_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='경매';

-- (2/49) tbl_auction_wishlist
create table tbl_auction_wishlist (
    id                  bigint generated always as identity primary key,
    auction_id          bigint   not null,
    member_id           bigint   not null,
    created_datetime          datetime not null default now(),
    unique key uk_auction_wish (auction_id, member_id),
    key idx_aw_member (member_id),
    constraint fk_aw_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_aw_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='경매 찜';

-- (3/49) tbl_badge
create table tbl_badge (
    id          bigint generated always as identity primary key,
    badge_key   varchar(255)  not null comment '뱃지 식별 키',
    badge_name  varchar(255) not null comment '뱃지 표시명',
    image_file  varchar(255) not null comment '이미지 파일명',
    description varchar(255) null     comment '획득 조건 설명',
    unique key uk_badge_key (badge_key)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='뱃지 마스터';

-- (4/49) tbl_bid
create table tbl_bid (
    id          bigint generated always as identity primary key,
    auction_id  bigint        not null comment '경매 FK',
    member_id   bigint        not null comment '입찰자 FK',
    bid_price   decimal(15,2) not null comment '입찰 금액',
    is_winning  tinyint       not null default 0 comment '최고가 여부',
    created_datetime  datetime      not null default now(),
    key idx_bid_auction  (auction_id, bid_price desc),
    key idx_bid_member   (member_id),
    constraint fk_bid_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_bid_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='입찰';

-- (5/49) tbl_block
create table tbl_block (
    id          bigint generated always as identity primary key,
    blocker_id  bigint   not null comment '차단한 회원',
    blocked_id  bigint   not null comment '차단당한 회원',
    created_datetime  datetime not null default now(),
    unique key uk_block (blocker_id, blocked_id),
    key idx_block_blocked (blocked_id),
    constraint fk_block_blocker foreign key (blocker_id)
        references tbl_member (id),
    constraint fk_block_blocked foreign key (blocked_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='차단';

-- (6/49) tbl_bookmark
create table tbl_bookmark (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null comment '저장한 회원',
    target_type varchar(255) not null comment '대상 타입 (WORK / GALLERY)',
    target_id   bigint      not null comment '대상 PK',
    created_datetime  datetime    not null default now(),
    unique key uk_bookmark (member_id, target_type, target_id),
    key idx_bookmark_target (target_type, target_id),
    constraint fk_bookmark_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='북마크';

-- (7/49) tbl_card
create table tbl_card (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null comment '회원 FK',
    card_company    varchar(255)  not null comment '카드사',
    card_number_masked varchar(255) not null comment '마스킹된 카드번호 (****-****-****-1234)',
    billing_key     varchar(255) null     comment 'PG 빌링키 (암호화 저장)',
    is_default      tinyint      not null default 0 comment '기본 카드 여부',
    created_datetime      datetime     not null default now(),
    deleted_datetime      datetime     null,
    key idx_card_member (member_id),
    constraint fk_card_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='카드';

-- (8/49) tbl_comment
create table tbl_comment (
    id           bigint generated always as identity primary key,
    member_id    bigint      not null comment '작성자 FK',
    target_type  varchar(255) not null comment '대상 타입 (WORK / GALLERY)',
    target_id    bigint      not null comment '대상 PK',
    parent_id    bigint      null     comment '부모 댓글 (대댓글)',
    content      varchar(255) not null comment '댓글 내용',
    is_pinned    tinyint     not null default 0 comment '고정 여부',
    like_count   int         not null default 0 comment '좋아요 수 (비정규화)',
    created_datetime   datetime    not null default now(),
    updated_datetime   datetime    not null default now() on update current_timestamp,
    deleted_datetime   datetime    null     comment '삭제 일시 (soft delete)',
    key idx_comment_target (target_type, target_id, created_datetime),
    key idx_comment_member (member_id),
    key idx_comment_parent (parent_id),
    constraint fk_comment_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_comment_parent foreign key (parent_id)
        references tbl_comment (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='댓글';

-- (9/49) tbl_comment_like
create table tbl_comment_like (
    id              bigint generated always as identity primary key,
    comment_id      bigint   not null,
    member_id       bigint   not null,
    created_datetime      datetime not null default now(),
    unique key uk_comment_like (comment_id, member_id),
    key idx_cl_member (member_id),
    constraint fk_cl_comment foreign key (comment_id)
        references tbl_comment (id),
    constraint fk_cl_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='댓글 좋아요';

-- (10/49) tbl_contest
create table tbl_contest (
    id              bigint generated always as identity primary key,
    member_id       bigint        not null comment '등록자 FK',
    title           varchar(255)  not null comment '제목',
    organizer       varchar(255)  not null comment '주최/주관 기관',
    description     varchar(255)  null     comment '목적 및 내용',
    cover_image     varchar(255)  null     comment '대표 이미지 URL',
    entry_start     date          not null comment '접수 시작일',
    entry_end       date          not null comment '접수 마감일',
    result_date     date          null     comment '결과 발표일',
    prize_info      varchar(255)  null     comment '상금 및 부상',
    price           decimal(15,2) null     comment '참가비',
    status          varchar(255)   not null default 'UPCOMING' comment '상태 (UPCOMING/OPEN/CLOSED/RESULT)',
    created_datetime      datetime      not null default now(),
    updated_datetime      datetime      not null default now() on update current_timestamp,
    deleted_datetime      datetime      null,
    key idx_contest_member (member_id),
    key idx_contest_status (status, entry_start),
    constraint fk_contest_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='콘테스트';

-- (11/49) tbl_contest_entry
create table tbl_contest_entry (
    id               bigint generated always as identity primary key,
    contest_id       bigint     not null comment '콘테스트 FK',
    work_id          bigint     not null comment '출품 작품 FK',
    member_id        bigint     not null comment '출품자 FK',
    award_rank       varchar(255) null    comment '수상 순위 (금/은/동/입선 등)',
    submitted_at     datetime   not null default now(),
    unique key uk_contest_entry (contest_id, work_id),
    key idx_ce_work   (work_id),
    key idx_ce_member (member_id),
    constraint fk_ce_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ce_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_ce_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='콘테스트 출품';

-- (12/49) tbl_contest_tag
create table tbl_contest_tag (
    id             bigint generated always as identity primary key,
    contest_id     bigint not null,
    tag_id         bigint not null,
    unique key uk_contest_tag (contest_id, tag_id),
    key idx_ct_tag (tag_id),
    constraint fk_ct_contest foreign key (contest_id)
        references tbl_contest (id),
    constraint fk_ct_tag foreign key (tag_id)
        references tbl_tag (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='콘테스트 태그';

-- (13/49) tbl_curator_setting
create table tbl_curator_setting (
    id                 bigint generated always as identity primary key,
    section            varchar(255) not null comment '섹션 (HERO/FEATURED/TRENDING)',
    target_type        varchar(255) not null comment '대상 타입 (WORK / GALLERY)',
    target_id          bigint      not null comment '대상 PK',
    sort_order         int         not null default 0,
    is_active          tinyint     not null default 1,
    admin_id           bigint      not null comment '설정한 관리자 FK',
    created_datetime         datetime    not null default now(),
    updated_datetime         datetime    not null default now() on update current_timestamp,
    key idx_cs_section (section, is_active, sort_order),
    key idx_cs_admin   (admin_id),
    constraint fk_cs_admin foreign key (admin_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='큐레이터 설정';

-- (14/49) tbl_display_control
create table tbl_display_control (
    id                 bigint generated always as identity primary key,
    target_type        varchar(255) not null comment '대상 타입 (WORK/GALLERY/AUCTION/MEMBER)',
    target_id          bigint      not null comment '대상 PK',
    action             varchar(255) not null comment '제어 동작 (HIDE/RESTRICT/BAN)',
    reason             varchar(255) null    comment '제어 사유',
    admin_id           bigint      not null comment '처리 관리자 FK',
    created_datetime         datetime    not null default now(),
    key idx_dc_target (target_type, target_id),
    key idx_dc_admin  (admin_id),
    constraint fk_dc_admin foreign key (admin_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='노출 제어';

-- (15/49) tbl_faq
create table tbl_faq (
    id         bigint generated always as identity primary key,
    question   varchar(255) not null comment '질문',
    answer     text         not null comment '답변',
    category   varchar(255)  null     comment '카테고리',
    sort_order int          not null default 0,
    is_active  tinyint      not null default 1,
    created_datetime datetime     not null default now(),
    updated_datetime datetime     not null default now() on update current_timestamp,
    key idx_faq_category (category, is_active, sort_order)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='FAQ';

-- (16/49) tbl_follow
create table tbl_follow (
    id           bigint generated always as identity primary key,
    follower_id  bigint   not null comment '팔로우 하는 사람',
    following_id bigint   not null comment '팔로우 당하는 사람',
    created_datetime   datetime not null default now(),
    unique key uk_follow (follower_id, following_id),
    key idx_follow_following (following_id),
    constraint fk_follow_follower foreign key (follower_id)
        references tbl_member (id),
    constraint fk_follow_following foreign key (following_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='팔로우';

-- (17/49) tbl_gallery
create table tbl_gallery (
    id            bigint generated always as identity primary key,
    member_id     bigint       not null comment '소유자 FK',
    title         varchar(255) not null comment '제목',
    description   varchar(255) null     comment '설명',
    cover_image   varchar(255) null     comment '커버 이미지 URL',
    allow_comment tinyint      not null default 1 comment '댓글 허용',
    show_similar  tinyint      not null default 1 comment '비슷한 작품 표시',
    work_count    int          not null default 0 comment '소속 작품 수 (비정규화)',
    status        varchar(255)  not null default 'EXHIBITING' comment '상태 (EXHIBITING/SCHEDULED/ENDED/DELETED)',
    created_datetime    datetime     not null default now(),
    updated_datetime    datetime     not null default now() on update current_timestamp,
    deleted_datetime    datetime     null,
    key idx_gallery_member (member_id),
    key idx_gallery_status (status, created_datetime desc),
    constraint fk_gallery_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='예술관';

-- (18/49) tbl_gallery_tag
create table tbl_gallery_tag (
    id             bigint generated always as identity primary key,
    gallery_id     bigint not null,
    tag_id         bigint not null,
    unique key uk_gallery_tag (gallery_id, tag_id),
    key idx_gt_tag (tag_id),
    constraint fk_gt_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gt_tag foreign key (tag_id)
        references tbl_tag (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='예술관 태그';

-- (19/49) tbl_gallery_work
create table tbl_gallery_work (
    id              bigint generated always as identity primary key,
    gallery_id      bigint not null,
    work_id         bigint not null,
    sort_order      int    not null default 0 comment '전시 순서',
    added_at        datetime not null default now(),
    unique key uk_gallery_work (gallery_id, work_id),
    key idx_gw_work (work_id),
    constraint fk_gw_gallery foreign key (gallery_id)
        references tbl_gallery (id),
    constraint fk_gw_work foreign key (work_id)
        references tbl_work (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='예술관 작품';

-- (20/49) tbl_hide
create table tbl_hide (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null comment '숨긴 회원',
    target_type varchar(255) not null comment '대상 타입 (WORK / GALLERY)',
    target_id   bigint      not null comment '대상 PK',
    created_datetime  datetime    not null default now(),
    unique key uk_hide (member_id, target_type, target_id),
    constraint fk_hide_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='숨기기';

-- (21/49) tbl_inquiry
create table tbl_inquiry (
    id          bigint generated always as identity primary key,
    member_id   bigint       null     comment '회원 FK (비회원 문의 가능)',
    content     varchar(255) not null comment '문의 내용',
    reply       text         null     comment '관리자 답변',
    status      varchar(255)  not null default 'PENDING' comment '상태 (PENDING/ANSWERED/CLOSED)',
    created_datetime  datetime     not null default now(),
    updated_datetime  datetime     not null default now() on update current_timestamp,
    key idx_inquiry_member (member_id),
    key idx_inquiry_status (status, created_datetime desc),
    constraint fk_inquiry_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='문의';

-- (22/49) tbl_like
create table tbl_like (
    id          bigint generated always as identity primary key,
    member_id   bigint      not null comment '좋아요 한 회원',
    target_type varchar(255) not null comment '대상 타입 (WORK)',
    target_id   bigint      not null comment '대상 PK',
    created_datetime  datetime    not null default now(),
    unique key uk_like (member_id, target_type, target_id),
    key idx_like_target (target_type, target_id),
    constraint fk_like_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='좋아요';

-- (23/49) tbl_member
create table tbl_member (
    id               bigint generated always as identity primary key,
    email            varchar(255) not null comment '이메일 (로그인 + 아이디찾기)',
    login_id         varchar(255)  not null comment '로그인 아이디',
    password         varchar(255) null     comment '비밀번호 (bcrypt, 소셜전용은 NULL)',
    nickname         varchar(255)  not null comment '닉네임',
    real_name        varchar(255)  null     comment '실명',
    birth_date       date         null     comment '생년월일',
    bio              varchar(255) null     comment '자기소개',
    profile_image    varchar(255) null     comment '프로필 이미지 URL',
    role             varchar(255)  not null default 'USER' comment '권한 (USER / ADMIN)',
    follower_count   int          not null default 0 comment '팔로워 수 (비정규화)',
    following_count  int          not null default 0 comment '팔로잉 수 (비정규화)',
    gallery_count    int          not null default 0 comment '예술관 수 (비정규화)',
    created_datetime       datetime     not null default now(),
    updated_datetime       datetime     not null default now() on update current_timestamp,
    deleted_datetime       datetime     null     comment '탈퇴 일시 (soft delete)',
    unique key uk_member_email     (email),
    unique key uk_member_login_id  (login_id),
    unique key uk_member_nickname  (nickname)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='회원';

-- (24/49) tbl_member_badge
create table tbl_member_badge (
    id              bigint generated always as identity primary key,
    member_id       bigint   not null,
    badge_id        bigint   not null,
    is_displayed    tinyint  not null default 0 comment '프로필 표시 여부 (max 2)',
    earned_at       datetime not null default now(),
    unique key uk_mb (member_id, badge_id),
    key idx_mb_badge (badge_id),
    constraint fk_mb_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mb_badge foreign key (badge_id)
        references tbl_badge (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='회원 뱃지';

-- (25/49) tbl_member_tag
create table tbl_member_tag (
    id            bigint generated always as identity primary key,
    member_id     bigint not null,
    tag_id        bigint not null,
    unique key uk_member_tag (member_id, tag_id),
    key idx_mt_tag (tag_id),
    constraint fk_mt_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_mt_tag foreign key (tag_id)
        references tbl_tag (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='회원 관심 태그';

-- (26/49) tbl_message
create table tbl_message (
    id              bigint generated always as identity primary key,
    message_room_id bigint       not null comment '메시지 방 FK',
    sender_id       bigint       not null comment '발신자 FK',
    content         varchar(255) not null comment '메시지 내용',
    is_read         tinyint      not null default 0,
    created_datetime      datetime     not null default now(),
    key idx_msg_room (message_room_id, created_datetime),
    key idx_msg_sender (sender_id),
    constraint fk_msg_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_msg_sender foreign key (sender_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='메시지';

-- (27/49) tbl_message_room
create table tbl_message_room (
    id              bigint generated always as identity primary key,
    created_datetime      datetime not null default now(),
    updated_datetime      datetime not null default now() on update current_timestamp
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='메시지 방';

-- (28/49) tbl_message_room_member
create table tbl_message_room_member (
    id              bigint generated always as identity primary key,
    message_room_id bigint   not null,
    member_id       bigint   not null,
    joined_at       datetime not null default now(),
    left_at         datetime null,
    unique key uk_room_member (message_room_id, member_id),
    key idx_mrm_member (member_id),
    constraint fk_mrm_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_mrm_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='메시지 방 참여자';

-- (29/49) tbl_notification
create table tbl_notification (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null comment '수신자 FK',
    sender_id       bigint       null     comment '발신자 FK (시스템 알림은 NULL)',
    noti_type       varchar(255)  not null comment '알림 타입 (LIKE/COMMENT/FOLLOW/BID/AUCTION_END/SETTLEMENT 등)',
    target_type     varchar(255)  null     comment '대상 타입',
    target_id       bigint       null     comment '대상 PK',
    message         varchar(255) not null comment '알림 메시지',
    is_read         tinyint      not null default 0 comment '읽음 여부',
    created_datetime      datetime     not null default now(),
    key idx_noti_member (member_id, is_read, created_datetime desc),
    constraint fk_noti_member foreign key (member_id)
        references tbl_member (id),
    constraint fk_noti_sender foreign key (sender_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='알림';

-- (30/49) tbl_notification_setting
create table tbl_notification_setting (
    id                  bigint generated always as identity primary key,
    member_id           bigint      not null comment '회원 FK',
    like_notify         varchar(255) not null default 'ALL' comment '좋아요 알림 (OFF/FOLLOWING/ALL)',
    comment_notify      varchar(255) not null default 'ALL' comment '댓글 알림 (OFF/FOLLOWING/ALL)',
    comment_like_notify tinyint     not null default 1 comment '댓글 좋아요 및 고정 (0/1)',
    first_post_notify   tinyint     not null default 1 comment '첫 게시물 및 스토리 (0/1)',
    birthday_notify     tinyint     not null default 1 comment '생일 (0/1)',
    pause_all           tinyint     not null default 0 comment '모두 일시 중단 (0/1)',
    updated_datetime          datetime    not null default now() on update current_timestamp,
    unique key uk_ns_member (member_id),
    constraint fk_ns_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='알림 설정';

-- (31/49) tbl_order
create table tbl_order (
    id                bigint         generated always as identity primary key,
    order_code        varchar(255)    not null                 comment '주문 코드 (예: O-OR3140248)',
    buyer_id          bigint         not null                 comment '구매자 회원 번호 (FK)',
    seller_id         bigint         not null                 comment '판매자 회원 번호 (FK)',
    work_id           bigint         not null                 comment '작품 번호 (FK)',
    auction_id        bigint         null                     comment '경매 번호 (경매 낙찰 시, FK)',
    order_type        varchar(255)    not null                 comment '주문 유형 (DIRECT, AUCTION)',
    total_price       decimal(15,2)  not null                 comment '총 구매가',
    fee_amount        decimal(15,2)  not null default 0       comment '수수료',
    shipping_fee      decimal(15,2)  not null default 0       comment '배송비',
    status            varchar(255)    not null default 'PENDING' comment '상태 (PENDING, PAID, SHIPPED, COMPLETED, CANCELLED, REFUNDED)',
    ordered_at        datetime       not null default now() comment '주문일',
    completed_at      datetime       null                     comment '완료일',
    unique key uk_order_code (order_code),
    index idx_order_buyer (buyer_id),
    index idx_order_seller (seller_id),
    index idx_order_work (work_id),
    index idx_order_auction (auction_id),
    index idx_order_status (status),
    constraint fk_order_buyer foreign key (buyer_id) references tbl_member(id),
    constraint fk_order_seller foreign key (seller_id) references tbl_member(id),
    constraint fk_order_work foreign key (work_id) references tbl_work(id),
    constraint fk_order_auction foreign key (auction_id) references tbl_auction(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='주문';

-- (32/49) tbl_payment
create table tbl_payment (
    id               bigint generated always as identity primary key,
    payment_code     varchar(255)   not null comment '결제번호 (O-OR...)',
    order_code       varchar(255)   not null comment '주문번호 (B-SN...)',
    buyer_id         bigint        not null comment '구매자 FK',
    seller_id        bigint        not null comment '판매자 FK',
    work_id          bigint        not null comment '작품 FK',
    auction_id       bigint        null     comment '경매 FK (경매 거래인 경우)',
    original_amount  decimal(15,2) not null comment '최초 결제금액',
    total_price      decimal(15,2) not null comment '총 구매가',
    total_fee        decimal(15,2) not null comment '총 수수료',
    pay_method       varchar(255)   not null comment '결제 수단 (KAKAO_PAY / CARD 등)',
    card_id          bigint        null     comment '사용 카드 FK',
    status           varchar(255)   not null default 'COMPLETED' comment '상태 (COMPLETED/REFUNDED/CANCELLED)',
    paid_at          datetime      not null default now() comment '거래 일시',
    created_datetime       datetime      not null default now(),
    unique key uk_payment_code (payment_code),
    unique key uk_order_code   (order_code),
    key idx_payment_buyer  (buyer_id),
    key idx_payment_seller (seller_id),
    key idx_payment_work   (work_id),
    key idx_payment_auction (auction_id),
    constraint fk_payment_buyer foreign key (buyer_id)
        references tbl_member (id),
    constraint fk_payment_seller foreign key (seller_id)
        references tbl_member (id),
    constraint fk_payment_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_payment_auction foreign key (auction_id)
        references tbl_auction (id),
    constraint fk_payment_card foreign key (card_id)
        references tbl_card (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='결제';

-- (33/49) tbl_payment_card
create table tbl_payment_card (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null                 comment '회원 번호 (FK)',
    card_company    varchar(255)  not null                 comment '카드사 (KB, 신한, 삼성 등)',
    card_number     varchar(255)  not null                 comment '카드 번호 (마스킹, 예: ****-****-****-7042)',
    expiry_date     varchar(255)   not null                 comment '만료일 (MM/YY)',
    is_default      tinyint(1)   not null default 0       comment '기본 카드 여부',
    is_auto_pay     tinyint(1)   not null default 0       comment '자동결제 사용 여부',
    billing_key     varchar(255) null                     comment '빌링키 (PG 연동용)',
    created_datetime      datetime     not null default now() comment '등록일',
    index idx_card_member (member_id),
    constraint fk_card_member foreign key (member_id) references tbl_member(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='결제 카드';

-- (34/49) tbl_report
create table tbl_report (
    id           bigint generated always as identity primary key,
    reporter_id  bigint       not null comment '신고자 FK',
    target_type  varchar(255)  not null comment '대상 타입 (WORK/MEMBER/COMMENT/GALLERY)',
    target_id    bigint       not null comment '대상 PK',
    reason       varchar(255)  not null comment '위반 사항 (SENSITIVE/IMPERSONATION/HARASSMENT/COPYRIGHT)',
    detail       varchar(255) null     comment '상세 내용',
    status       varchar(255)  not null default 'PENDING' comment '상태 (PENDING/REVIEWING/RESOLVED/CANCELLED)',
    resolved_at  datetime     null     comment '처리 완료 일시',
    created_datetime   datetime     not null default now(),
    updated_datetime   datetime     not null default now() on update current_timestamp,
    key idx_report_reporter (reporter_id),
    key idx_report_target   (target_type, target_id),
    key idx_report_status   (status, created_datetime desc),
    constraint fk_report_reporter foreign key (reporter_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='신고';

-- (35/49) tbl_search_history
create table tbl_search_history (
    id                bigint generated always as identity primary key,
    member_id         bigint       not null comment '회원 FK',
    keyword           varchar(255) not null comment '검색 키워드',
    searched_at       datetime     not null default now(),
    key idx_sh_member (member_id, searched_at desc),
    constraint fk_sh_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='검색 이력';

-- (36/49) tbl_settlement
create table tbl_settlement (
    id                  bigint generated always as identity primary key,
    payment_id          bigint        not null comment '결제 FK',
    member_id           bigint        not null comment '수령인(판매자) FK',
    pre_tax_amount      decimal(15,2) not null comment '세전 정산금',
    total_deduction     decimal(15,2) not null comment '공제 합계',
    net_amount          decimal(15,2) not null comment '실수령 정산금',
    effective_tax_rate  decimal(5,2)  not null comment '실효세율 (%)',
    status              varchar(255)   not null default 'PENDING' comment '상태 (PENDING/APPROVED/PAID/REJECTED)',
    approved_at         datetime      null     comment '승인 일시',
    paid_at             datetime      null     comment '지급 일시',
    created_datetime          datetime      not null default now(),
    updated_datetime          datetime      not null default now() on update current_timestamp,
    key idx_settlement_payment (payment_id),
    key idx_settlement_member  (member_id),
    key idx_settlement_status  (status, created_datetime desc),
    constraint fk_settlement_payment foreign key (payment_id)
        references tbl_payment (id),
    constraint fk_settlement_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='정산';

-- (37/49) tbl_settlement_deduction
create table tbl_settlement_deduction (
    id             bigint generated always as identity primary key,
    settlement_id  bigint        not null comment '정산 FK',
    deduction_name varchar(255)  not null comment '공제 항목명',
    amount         decimal(15,2) not null comment '공제 금액',
    sort_order     int           not null default 0,
    key idx_sd_settlement (settlement_id),
    constraint fk_sd_settlement foreign key (settlement_id)
        references tbl_settlement (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='정산 공제 항목';

-- (38/49) tbl_settlement_item
create table tbl_settlement_item (
    id                  bigint generated always as identity primary key,
    settlement_id       bigint         not null                 comment '정산 번호 (FK)',
    item_type           varchar(255)    not null                 comment '항목 유형 (PLATFORM_FEE, TAX, INSURANCE 등)',
    item_name           varchar(255)   not null                 comment '항목명',
    amount              decimal(15,2)  not null                 comment '공제 금액',
    created_datetime          datetime       not null default now() comment '생성일',
    index idx_si_settlement (settlement_id),
    constraint fk_si_settlement foreign key (settlement_id) references tbl_settlement(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='정산 공제 항목';

-- (39/49) tbl_social_account
create table tbl_social_account (
    id                 bigint generated always as identity primary key,
    member_id          bigint       not null                 comment '회원 번호 (FK)',
    provider           varchar(255)  not null                 comment '소셜 제공자 (GOOGLE, NAVER, KAKAO)',
    provider_id        varchar(255) not null                 comment '소셜 제공자 고유 ID',
    provider_email     varchar(255) null                     comment '소셜 이메일',
    access_token       varchar(255) null                     comment '액세스 토큰',
    refresh_token      varchar(255) null                     comment '리프레시 토큰',
    created_datetime         datetime     not null default now() comment '연동일',
    unique key uk_social_provider (provider, provider_id),
    index idx_social_member (member_id),
    constraint fk_social_member foreign key (member_id) references tbl_member(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='소셜 로그인 계정';

-- (40/49) tbl_social_login
create table tbl_social_login (
    id               bigint generated always as identity primary key,
    member_id        bigint       not null comment '회원 FK',
    provider         varchar(255)  not null comment '제공자 (GOOGLE / NAVER / KAKAO)',
    provider_id      varchar(255) not null comment '제공자측 고유 ID',
    connected_at     datetime     not null default now(),
    unique key uk_social_provider  (provider, provider_id),
    key idx_social_member          (member_id),
    constraint fk_social_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='소셜 로그인';

-- (41/47) tbl_tag
create table tbl_tag (
    id       bigint generated always as identity primary key,
    tag_name varchar(255)  not null comment '태그명',
    unique key uk_tag_name (tag_name)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='태그';

-- (44/49) tbl_wishlist
create table tbl_wishlist (
    id           bigint generated always as identity primary key,
    member_id    bigint   not null                 comment '회원 번호 (FK)',
    work_id      bigint   not null                 comment '작품 번호 (FK)',
    created_datetime   datetime not null default now() comment '찜일',
    unique key uk_wishlist (member_id, work_id),
    index idx_wishlist_work (work_id),
    index idx_wishlist_member (member_id),
    constraint fk_wishlist_member foreign key (member_id) references tbl_member(id),
    constraint fk_wishlist_work foreign key (work_id) references tbl_work(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='찜 (위시리스트)';

-- (45/49) tbl_work
create table tbl_work (
    id               bigint generated always as identity primary key,
    member_id        bigint        not null comment '작성자 FK',
    title            varchar(255)  not null comment '제목',
    description      varchar(255)  null     comment '설명',
    price            decimal(15,2) null     comment '가격 (거래 토글 ON 시)',
    is_tradable      tinyint       not null default 0 comment '거래 가능 여부',
    allow_comment    tinyint       not null default 1 comment '댓글 허용',
    show_similar     tinyint       not null default 1 comment '비슷한 작품 표시',
    link_url         varchar(255)  null     comment '외부 링크 URL',
    view_count       int           not null default 0 comment '조회수 (비정규화)',
    like_count       int           not null default 0 comment '좋아요 수 (비정규화)',
    save_count       int           not null default 0 comment '저장 수 (비정규화)',
    comment_count    int           not null default 0 comment '댓글 수 (비정규화)',
    status           varchar(255)   not null default 'ACTIVE' comment '상태 (ACTIVE/HIDDEN/DELETED)',
    created_datetime       datetime      not null default now(),
    updated_datetime       datetime      not null default now() on update current_timestamp,
    deleted_datetime       datetime      null     comment '삭제 일시 (soft delete)',
    key idx_work_member    (member_id),
    key idx_work_status    (status, created_datetime desc),
    key idx_work_created   (created_datetime desc),
    constraint fk_work_member foreign key (member_id)
        references tbl_member (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='작품';

-- (46/49) tbl_work_file
create table tbl_work_file (
    id            bigint generated always as identity primary key,
    work_id       bigint       not null comment '작품 FK',
    file_url      varchar(255) not null comment '파일 URL (S3 등)',
    file_type     varchar(255)  not null comment '파일 타입 (IMAGE / VIDEO / THUMBNAIL)',
    file_size     int          null     comment '파일 크기 (bytes)',
    width         int          null     comment '이미지 너비 (px)',
    height        int          null     comment '이미지 높이 (px)',
    sort_order    int          not null default 0 comment '정렬 순서',
    created_datetime    datetime     not null default now(),
    key idx_wf_work (work_id),
    constraint fk_wf_work foreign key (work_id)
        references tbl_work (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='작품 파일';

-- (47/49) tbl_work_hide
create table tbl_work_hide (
    id          bigint generated always as identity primary key,
    member_id   bigint   not null                 comment '회원 번호 (FK)',
    work_id     bigint   not null                 comment '작품 번호 (FK)',
    created_datetime  datetime not null default now() comment '숨김일',
    unique key uk_work_hide (member_id, work_id),
    index idx_hide_member (member_id),
    constraint fk_hide_member foreign key (member_id) references tbl_member(id),
    constraint fk_hide_work foreign key (work_id) references tbl_work(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='작품 숨김 (사용자별 피드에서 숨기기)';

-- (48/49) tbl_work_like
create table tbl_work_like (
    id            bigint generated always as identity primary key,
    member_id     bigint   not null                 comment '회원 번호 (FK)',
    work_id       bigint   not null                 comment '작품 번호 (FK)',
    created_datetime    datetime not null default now() comment '좋아요일',
    unique key uk_work_like (member_id, work_id),
    index idx_work_like_work (work_id),
    index idx_work_like_member (member_id),
    constraint fk_work_like_member foreign key (member_id) references tbl_member(id),
    constraint fk_work_like_work foreign key (work_id) references tbl_work(id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='작품 좋아요';

-- (49/49) tbl_work_tag
create table tbl_work_tag (
    id          bigint generated always as identity primary key,
    work_id     bigint not null,
    tag_id      bigint not null,
    unique key uk_work_tag (work_id, tag_id),
    key idx_wt_tag (tag_id),
    constraint fk_wt_work foreign key (work_id)
        references tbl_work (id),
    constraint fk_wt_tag foreign key (tag_id)
        references tbl_tag (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci comment='작품 태그';
