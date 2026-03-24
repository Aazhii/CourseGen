import { apiFetch } from "./apiClient";

export const autocompleteUsers = async (query, limit = 8) => {
  const params = new URLSearchParams({ q: query, types: "USER", limit: String(limit) });
  const res = await apiFetch(`/api/search/autocomplete?${params.toString()}`);
  return res;
};

