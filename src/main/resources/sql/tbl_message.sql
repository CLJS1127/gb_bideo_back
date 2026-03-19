-- ----------------------------------------------------------
-- 29. 메시지 (tbl_message)
-- ----------------------------------------------------------
drop table if exists tbl_message cascade;

create table tbl_message (
    id              bigint generated always as identity primary key,
    message_room_id bigint        not null,
    sender_id       bigint        not null,
    content         varchar(255) not null,
    is_read         boolean       not null default false,
    created_datetime      timestamp     not null default now(),

    constraint fk_msg_room foreign key (message_room_id)
        references tbl_message_room (id),
    constraint fk_msg_sender foreign key (sender_id)
        references tbl_member (id)
);

comment on table tbl_message is '메시지';
comment on column tbl_message.id is 'PK';
comment on column tbl_message.message_room_id is '메시지 방 FK';
comment on column tbl_message.sender_id is '발신자 FK';
comment on column tbl_message.content is '메시지 내용';
comment on column tbl_message.is_read is '읽음 여부';

create index idx_msg_room on tbl_message (message_room_id, created_datetime);
create index idx_msg_sender on tbl_message (sender_id);
