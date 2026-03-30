package com.app.bideo.member;

import com.app.bideo.common.enumeration.MemberStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MemberStatusTest {

    @Test
    void from_supportsSuspendedAndBannedStatuses() {
        assertEquals(MemberStatus.SUSPENDED, MemberStatus.from("SUSPENDED"));
        assertEquals(MemberStatus.BANNED, MemberStatus.from("BANNED"));
        assertEquals(MemberStatus.ACTIVE, MemberStatus.from("ACTIVE"));
    }
}
