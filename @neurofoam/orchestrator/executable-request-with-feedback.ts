import * as neurofoamTypes from "@neurofoam/types";
import ExecutableRequest from "./executable-request";

type ExecutableRequestWithFeedback<TRequest extends neurofoamTypes.Json> = {
  readonly executableRequest: ExecutableRequest<TRequest>;
  readonly sessionUuidIsNew: boolean;
};

export default ExecutableRequestWithFeedback;
