import { Json } from "./json";
import { PersistenceResult } from "./persistence-result";

export type Persistence<TState extends Json, TEvent extends Json> = {
  initialize(): Promise<void>;

  getBubble(
    bubbleUuid: string
  ): Promise<null | {
    readonly currentState: TState;
    readonly latestEventUuid: string;
  }>;

  recordFirstEvent(
    bubbleUuid: string,
    eventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<PersistenceResult>;

  recordSubsequentEvent(
    bubbleUuid: string,
    previousEventUuid: string,
    nextEventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<PersistenceResult>;
};
