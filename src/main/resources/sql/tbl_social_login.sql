-- ----------------------------------------------------------
-- 6. 소셜 로그인 (tbl_social_login)
-- ----------------------------------------------------------
drop table if exists tbl_social_login cascade;

create table tbl_social_login (
    id              bigint generated always as identity primary key,
    member_id       bigint       not null,
    provider        varchar(255)  not null,
    provider_id     varchar(255) not null,
    connected_at    timestamp    not null default now(),

    constraint uk_social_provider unique (provider, provider_id),
    constraint fk_social_member foreign key (member_id)
        references tbl_member (id)
);

comment on table tbl_social_login is '소셜 로그인';
comment on column tbl_social_login.id is 'PK';
comment on column tbl_social_login.member_id is '회원 FK';
comment on column tbl_social_login.provider is '제공자 (GOOGLE / NAVER / KAKAO)';
comment on column tbl_social_login.provider_id is '제공자측 고유 ID';

create index idx_social_member on tbl_social_login (member_id);
