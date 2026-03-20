-- ----------------------------------------------------------
-- 소셜 로그인 (tbl_oauth)
-- ----------------------------------------------------------
drop table if exists tbl_oauth cascade;
drop type if exists oauth_provider cascade;

create type oauth_provider as enum('kakao', 'naver');

create table tbl_oauth
(
    id                  bigint generated always as identity primary key,
    member_id           bigint not null,
    provider_id         varchar(255) unique not null,
    provider            oauth_provider,
    created_datetime    timestamp    not null default now(),
    updated_datetime    timestamp    not null default now(),
    deleted_datetime    timestamp    null,

    constraint fk_oauth_member foreign key (member_id) references tbl_member(id)
);

comment on table tbl_oauth is '소셜 로그인';
comment on column tbl_oauth.id is '소셜 로그인 번호 (PK)';
comment on column tbl_oauth.member_id is '멤버 아이디';
comment on column tbl_oauth.provider_id is '소셜 아이디';
comment on column tbl_oauth.provider is '소셜 정보';
comment on column tbl_oauth.created_datetime is '생성 일시';
comment on column tbl_oauth.updated_datetime is '수정 일시';
comment on column tbl_oauth.deleted_datetime is '탈퇴 일시 (soft delete)';
