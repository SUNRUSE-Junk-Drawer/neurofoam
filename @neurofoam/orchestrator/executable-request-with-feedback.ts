import * as neurofoamTypes from "@neurofoam/types";
import { ExecutableRequest } from "./executable-request";

export type ExecutableRequestWithFeedback<
  TRequest extends neurofoamTypes.Json
> = {
  readonly executableRequest: ExecutableRequest<TRequest>;
  readonly sessionUuidIsNew: boolean;
};
