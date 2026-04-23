export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    detail: (id: string) => [...queryKeys.projects.all, "detail", id] as const,
    prompts: (id: string) => [...queryKeys.projects.all, "detail", id, "prompts"] as const,
  },
};
