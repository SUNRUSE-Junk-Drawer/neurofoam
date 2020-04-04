import * as neurofoamTypes from "@neurofoam/types"
import ExecutableRequest from "./executable-request"
import executeOnce from "./execute-once"

export default async function <
  TState extends neurofoamTypes.Json,
  TEvent extends neurofoamTypes.Json,
  TRequest extends neurofoamTypes.Json,
  >(
    persistence: neurofoamTypes.Persistence<TState, TEvent>,
    application: neurofoamTypes.Application<TState, TEvent, TRequest>,
    executableRequest: ExecutableRequest<TRequest>,
): Promise<neurofoamTypes.Json> {
  while (true) {
    const response = await executeOnce(persistence, application, executableRequest)
    if (response !== undefined) {
      return response
    }
  }
}
