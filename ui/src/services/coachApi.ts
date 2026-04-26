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

/**
 * Stream AI Coach response using SSE
 */
export async function streamCoachResponse(
  payload: CoachRequest,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
) {
  const token = localStorage.getItem('token');
  const url = "/api/coach/respond/stream";
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`SSE failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("ReadableStream not supported");

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const content = line.replace("data:", "").trim();
          if (content) {
            onToken(content);
          }
        }
      }
    }
    
    onComplete();
  } catch (err) {
    onError(err);
  }
}
