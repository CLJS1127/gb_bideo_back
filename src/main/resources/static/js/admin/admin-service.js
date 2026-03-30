const BIDEO_SERVICE = {
    async request(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            let message = "요청 처리 중 오류가 발생했습니다.";
            try {
                const payload = await response.json();
                message = payload.message || message;
            } catch (error) {
                // ignore parse failure and keep default message
            }
            throw new Error(message);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            return response.json();
        }
        return response.text();
    },

    toQueryString(params = {}) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                searchParams.set(key, value);
            }
        });
        const query = searchParams.toString();
        return query ? `?${query}` : "";
    },

    searchMembers(keyword) {
        return this.request(`/api/admin/members${this.toQueryString({ keyword, size: 10 })}`);
    },

    updateMemberStatus(memberId, status) {
        return this.request(`/api/admin/members/${memberId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status })
        });
    },

    replyInquiry(inquiryId, reply) {
        return this.request(`/api/admin/inquiries/${inquiryId}/reply`, {
            method: "PATCH",
            body: JSON.stringify({ reply })
        });
    },

    createRestriction(payload) {
        return this.request("/api/admin/restrictions", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    updateRestriction(restrictionId, payload) {
        return this.request(`/api/admin/restrictions/${restrictionId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        });
    },

    releaseRestriction(restrictionId) {
        return this.request(`/api/admin/restrictions/${restrictionId}/release`, {
            method: "PATCH"
        });
    }
};
