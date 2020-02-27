import Json from "./json"
import PersistenceResult from "./persistence-result"

type Persistence<
  TState extends Json,
  TEvent extends Json,
  > = {
    get(
      bubbleUuid: string,
    ): Promise<null | {
      readonly state: TState
      readonly versionUuid: string
    }>

    tryCreate(
      bubbleUuid: string,
      event: TEvent,
      state: TState,
    ): Promise<PersistenceResult>

    tryUpdate(
      bubbleUuid: string,
      previousVersionUuid: string,
      event: TEvent,
      nextState: TState,
    ): Promise<PersistenceResult>
  }

export default Persistence
