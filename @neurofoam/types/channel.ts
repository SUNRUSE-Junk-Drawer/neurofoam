import { Json } from "./json";
import { ErrorResponse } from "./error-response";
import { FetchedBubbleUuid } from "./fetched-bubble-uuid";
import { FetchedSessionUuid } from "./fetched-session-uuid";
import { FetchedRequestLength } from "./fetched-request-length";
import { FetchedRequest } from "./fetched-request";

export type Channel<
  TGetBubbleUuidInstance,
  TGetSessionUuidInstance,
  TCheckMetadataInstance,
  TGetRequestLengthInstance,
  TGetRequestInstance,
  TRespondWithErrorInstance,
  TRespondInstance
> = {
  getBubbleUuid(instance: TGetBubbleUuidInstance): Promise<FetchedBubbleUuid>;

  getSessionUuid(
    instance: TGetSessionUuidInstance
  ): Promise<FetchedSessionUuid>;

  checkMetadata(instance: TCheckMetadataInstance): Promise<boolean>;

  getRequestLength(
    instance: TGetRequestLengthInstance
  ): Promise<FetchedRequestLength>;

  getRequest(
    instance: TGetRequestInstance,
    length: number
  ): Promise<FetchedRequest>;

  respondWithError(
    instance: TRespondWithErrorInstance,
    error: ErrorResponse
  ): Promise<void>;

  respond(
    instance: TRespondInstance,
    sessionUuidIfNew: null | string,
    response: Json
  ): Promise<void>;
};
