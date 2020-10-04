export type SessionPersistence = {
  list(instance: string): Promise<ReadonlyArray<string>>;
};
