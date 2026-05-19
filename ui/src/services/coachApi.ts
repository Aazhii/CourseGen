import { apiFetch } from "./apiClient";
import { CoachRequest, CoachResponse } from "@/types/coach";
import { executeMcpTool } from "./mcpApi";
import { USE_MCP_CLIENT } from "@/constants";

export async function getCoachResponse(payload: CoachRequest): Promise<CoachResponse> {
  if (USE_MCP_CLIENT) {
    const mcpResponse = await executeMcpTool<CoachResponse>({
      tool: "coach.respond",
      input: payload,
    });

    if (!mcpResponse?.success || !mcpResponse.data) {
      throw new Error(mcpResponse?.error || "MCP coach.respond failed");
    }
    return mcpResponse.data;
  }

  const response = await apiFetch("/api/coach/respond", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response?.data) {
    return response.data as CoachResponse;
  }

  return response as CoachResponse;
}

