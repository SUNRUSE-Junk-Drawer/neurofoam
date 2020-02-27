import Json from "./json"
import PersistenceResult from "./persistence-result"

type Persistence<
  TState extends Json,
  TEvent extends Json,
  > = {
    initialize(): Promise<void>

    getBubble(
      bubbleUuid: string,
    ): Promise<null | {
      readonly state: TState
      readonly eventUuid: string
    }>

    recordFirstEvent(
      bubbleUuid: string,
      sessionUuid: string,
      event: TEvent,
      resultingState: TState,
    ): Promise<PersistenceResult>

    recordSubsequentEvent(
      bubbleUuid: string,
      previousEventId: string,
      sessionUuid: string,
      event: TEvent,
      resultingState: TState,
    ): Promise<PersistenceResult>
  }

export default Persistence
