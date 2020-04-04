import * as neurofoamTypes from "@neurofoam/types"
import ExecutableRequest from "./executable-request"
import generateUuid from "./generate-uuid"

export default async function <
  TState extends neurofoamTypes.Json,
  TEvent extends neurofoamTypes.Json,
  TRequest extends neurofoamTypes.Json,
  >(
    persistence: neurofoamTypes.Persistence<TState, TEvent>,
    application: neurofoamTypes.Application<TState, TEvent, TRequest>,
    executableRequest: ExecutableRequest<TRequest>,
): Promise<undefined | neurofoamTypes.Json> {
  const bubble = await persistence.getBubble(executableRequest.bubbleUuid)

  const next = await application.requestCallback(application.initialState, executableRequest.sessionUuid, executableRequest.request)

  if (next.event !== null) {
    let persistenceResult: neurofoamTypes.PersistenceResult

    if (bubble === null) {
      const state = application.applyEvent(application.initialState, next.event)
      persistenceResult = await persistence.recordFirstEvent(executableRequest.bubbleUuid, await generateUuid(), executableRequest.sessionUuid, next.event, state)
    } else {
      const state = application.applyEvent(bubble.currentState, next.event)
      persistenceResult = await persistence.recordSubsequentEvent(executableRequest.bubbleUuid, bubble.latestEventUuid, await generateUuid(), executableRequest.sessionUuid, next.event, state)
    }

    if (persistenceResult === `optimisticConcurrencyControlCollision`) {
      return undefined
    }
  }

  return next.response
}
