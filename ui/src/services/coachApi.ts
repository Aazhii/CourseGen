import { apiFetch } from "./apiClient";
import { CoachRequest, CoachResponse } from "@/types/coach";

export async function getCoachResponse(payload: CoachRequest): Promise<CoachResponse> {
  const response = await apiFetch("/api/coach/respond", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response?.data) {
    return response.data as CoachResponse;
  }

  return response as CoachResponse;
}

