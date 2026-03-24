import { apiFetch } from "./apiClient";

export async function fetchSharedWithMeInvites() {
  const res = await apiFetch("/api/sharing/invites/shared-with-me", {
    method: "GET",
  });
  return res.data;
}

export async function fetchSharedByMeInvites() {
  const res = await apiFetch("/api/sharing/invites/shared-by-me", {
    method: "GET",
  });
  return res.data;
}

export async function fetchInviteSummary() {
  const res = await apiFetch("/api/sharing/invites/summary", {
    method: "GET",
  });
  return res.data;
}

export async function markInviteRead(inviteId) {
  const res = await apiFetch(`/api/sharing/invites/${inviteId}/read`, {
    method: "PUT",
  });
  return res.data;
}

export async function acceptInvite(inviteId) {
  const res = await apiFetch(`/api/sharing/invites/${inviteId}/accept`, {
    method: "PUT",
  });
  return res.data;
}

export async function declineInvite(inviteId) {
  const res = await apiFetch(`/api/sharing/invites/${inviteId}/decline`, {
    method: "PUT",
  });
  return res.data;
}

export async function markAllInvitesRead() {
  const res = await apiFetch("/api/sharing/invites/mark-all-read", {
    method: "PUT",
  });
  return res.data;
}
