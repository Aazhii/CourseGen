import { apiFetch } from './apiClient';

export interface AutoGenStatus {
  enabled: boolean;
  running: boolean;
  batchSize: number;
  intervalMs: number;
  pendingLessons: number;
  totalGenerated: number;
  totalFailed: number;
  lastRunTimestamp: number;
  lastError: string | null;
}

export async function getAutoGenStatus(): Promise<AutoGenStatus> {
  const response = await apiFetch('/api/admin/auto-generation/status');
  return (response?.data ?? response) as AutoGenStatus;
}

export async function toggleAutoGen(enabled: boolean): Promise<{ enabled: boolean; pendingLessons: number }> {
  const response = await apiFetch('/api/admin/auto-generation/toggle', {
    method: 'POST',
    body: JSON.stringify({ enabled }),
  });
  return (response?.data ?? response) as { enabled: boolean; pendingLessons: number };
}

export async function configureAutoGen(config: { batchSize?: number; intervalMs?: number }): Promise<{ batchSize: number; intervalMs: number }> {
  const response = await apiFetch('/api/admin/auto-generation/configure', {
    method: 'POST',
    body: JSON.stringify(config),
  });
  return (response?.data ?? response) as { batchSize: number; intervalMs: number };
}

