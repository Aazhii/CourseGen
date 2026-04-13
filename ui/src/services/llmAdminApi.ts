import { apiFetch } from "./apiClient";

export type ProviderType = "GEMINI" | "GROQ";
export type WorkloadType = "COURSE_GENERATION" | "LESSON_GENERATION" | "AI_COACH";

export interface LlmProvider {
  id: number;
  code: string;
  displayName: string;
  providerType: ProviderType;
  modelName: string;
  baseUrl?: string | null;
  keyCooldownHours: number;
  enabled: boolean;
  keyCount: number;
  activeKeyCount: number;
  coolingDownKeyCount: number;
  lastError?: string | null;
  lastErrorAt?: string | null;
  lastSuccessAt?: string | null;
  maskedKeys: string[];
}

export interface LlmRoute {
  workload: WorkloadType;
  providerCode: string;
  providerDisplayName: string;
}

export interface LlmProviderHealth {
  providerCode: string;
  activeKeyCount: number;
  coolingDownKeyCount: number;
  lastError?: string | null;
  lastErrorAt?: string | null;
  lastSuccessAt?: string | null;
}

export interface LlmProviderPayload {
  code: string;
  displayName: string;
  providerType: ProviderType;
  modelName: string;
  baseUrl?: string;
  keyCooldownHours: number;
  enabled: boolean;
  apiKeys: string[];
}

export async function fetchLlmProviders(): Promise<LlmProvider[]> {
  return apiFetch("/api/admin/llm/providers");
}

export async function upsertLlmProvider(payload: LlmProviderPayload): Promise<LlmProvider> {
  return apiFetch(`/api/admin/llm/providers/${encodeURIComponent(payload.code)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchLlmRoutes(): Promise<LlmRoute[]> {
  return apiFetch("/api/admin/llm/routes");
}

export async function fetchLlmProviderHealth(): Promise<LlmProviderHealth[]> {
  return apiFetch("/api/admin/llm/health");
}

export async function upsertLlmRoute(workload: WorkloadType, providerCode: string): Promise<LlmRoute> {
  return apiFetch("/api/admin/llm/routes", {
    method: "PUT",
    body: JSON.stringify({ workload, providerCode }),
  });
}



