import { Json } from "../json";
import { OptimisticConcurrencyResult } from "../optimistic-concurrency-result";

export type StatePersistence<TState extends Json> = {
  initialize(): Promise<void>;

  get(
    instance: string
  ): Promise<{
    readonly state: TState;
    readonly version: string;
  }>;

  insert(instance: string, state: TState): Promise<OptimisticConcurrencyResult>;

  update(
    instance: string,
    expectedVersion: string,
    state: TState
  ): Promise<OptimisticConcurrencyResult>;
};
