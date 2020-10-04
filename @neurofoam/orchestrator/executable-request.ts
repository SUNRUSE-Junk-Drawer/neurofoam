import * as neurofoamTypes from "@neurofoam/types";

export type ExecutableRequest<TRequest extends neurofoamTypes.Json> = {
  readonly bubbleUuid: string;
  readonly sessionUuid: string;
  readonly request: TRequest;
};
