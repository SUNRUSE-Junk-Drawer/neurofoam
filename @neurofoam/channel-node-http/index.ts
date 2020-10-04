import * as url from "url";
import * as neurofoamTypes from "@neurofoam/types";
import { decodeUtf8 } from "./decode-utf8";
import { GetBubbleUuidInstance } from "./get-bubble-uuid-instance";
import { GetSessionUuidInstance } from "./get-session-uuid-instance";
import { CheckMetadataInstance } from "./check-metadata-instance";
import { GetRequestLengthInstance } from "./get-request-length-instance";
import { GetRequestInstance } from "./get-request-instance";
import { RespondWithErrorInstance } from "./respond-with-error-instance";
import { RespondInstance } from "./respond-instance";
import { isContentTypeHeaderValid } from "./is-content-type-header-valid";
import { isContentEncodingHeaderValid } from "./is-content-encoding-header-valid";
import { isAcceptHeaderValid } from "./is-accept-header-valid";
import { isAcceptCharsetHeaderValid } from "./is-accept-charset-header-valid";
import { isAcceptEncodingHeaderValid } from "./is-accept-encoding-header-valid";

const authorizationRegex = /^\s*BEARER\s+(.*)\s*$/i;
const contentLengthRegex = /^\s*\d+\s*$/;

const errorResponseStatusCodeMappings: {
  readonly [error in neurofoamTypes.ErrorResponse]?: number;
} = {
  invalidBubbleUuid: 404,
  invalidSessionUuid: 403,
  requestTooShort: 411,
  requestTooLong: 413,
  requestIncorrectlyEncoded: 415,
  nonJsonRequest: 400,
  requestFailsSchemaValidation: 422,
  requestShorterThanIndicated: 400,
  requestLongerThanIndicated: 400,
  invalidRequestLength: 400,
};

export class NeurofoamChannelNodeHttp
  implements
    neurofoamTypes.Channel<
      GetBubbleUuidInstance,
      GetSessionUuidInstance,
      CheckMetadataInstance,
      GetRequestLengthInstance,
      GetRequestInstance,
      RespondWithErrorInstance,
      RespondInstance
    > {
  async getBubbleUuid(
    instance: GetBubbleUuidInstance
  ): Promise<neurofoamTypes.FetchedBubbleUuid> {
    if (instance.request.url === undefined) {
      return {
        type: `invalid`,
      };
    }

    const parsed = url.parse(instance.request.url);

    if (parsed.pathname === null) {
      return {
        type: `invalid`,
      };
    }

    const bubbleUuid = parsed.pathname.replace(/^\//, ``).replace(/\/$/, ``);

    if (bubbleUuid === ``) {
      return {
        type: `invalid`,
      };
    }

    return {
      type: `given`,
      bubbleUuid,
    };
  }

  async getSessionUuid(
    instance: GetSessionUuidInstance
  ): Promise<neurofoamTypes.FetchedSessionUuid> {
    if (
      instance.request.headers.authorization === undefined ||
      instance.request.headers.authorization.trim() === ``
    ) {
      return {
        type: `none`,
      };
    }

    const match = authorizationRegex.exec(
      instance.request.headers.authorization
    );

    if (match === null) {
      return {
        type: `invalid`,
      };
    }

    return {
      type: `given`,
      sessionUuid: match[1].trim(),
    };
  }

  async checkMetadata(instance: CheckMetadataInstance): Promise<boolean> {
    if (instance.request.method !== `POST`) {
      await new Promise((resolve) =>
        instance.response.writeHead(405).end(resolve)
      );
      return false;
    }

    if (!isContentTypeHeaderValid(instance.request.headers[`content-type`])) {
      await new Promise((resolve) =>
        instance.response.writeHead(415).end(resolve)
      );
      return false;
    }

    if (
      !isContentEncodingHeaderValid(
        instance.request.headers[`content-encoding`]
      )
    ) {
      await new Promise((resolve) =>
        instance.response.writeHead(415).end(resolve)
      );
      return false;
    }

    if (!isAcceptHeaderValid(instance.request.headers.accept)) {
      await new Promise((resolve) =>
        instance.response.writeHead(406).end(resolve)
      );
      return false;
    }

    if (
      !isAcceptCharsetHeaderValid(instance.request.headers["accept-charset"])
    ) {
      await new Promise((resolve) =>
        instance.response.writeHead(406).end(resolve)
      );
      return false;
    }

    if (
      !isAcceptEncodingHeaderValid(instance.request.headers["accept-encoding"])
    ) {
      await new Promise((resolve) =>
        instance.response.writeHead(406).end(resolve)
      );
      return false;
    }

    return true;
  }

  async getRequestLength(
    instance: GetRequestLengthInstance
  ): Promise<neurofoamTypes.FetchedRequestLength> {
    const contentLength = instance.request.headers[`content-length`];

    if (contentLength === undefined || contentLength.trim() === ``) {
      return {
        type: `none`,
      };
    }

    if (!contentLengthRegex.test(contentLength)) {
      return {
        type: `invalid`,
      };
    }

    return {
      type: `given`,
      length: parseInt(contentLength),
    };
  }

  async getRequest(
    instance: GetRequestInstance,
    length: number
  ): Promise<neurofoamTypes.FetchedRequest> {
    return await new Promise<neurofoamTypes.FetchedRequest>((resolve) => {
      let totalLength = 0;
      const chunks: Buffer[] = [];

      function removeListeners(): void {
        instance.request
          .removeListener(`error`, onError)
          .removeListener(`aborted`, onAborted)
          .removeListener(`data`, onData)
          .removeListener(`end`, onEnd);
      }

      function onError(): void {
        removeListeners();
        resolve({
          type: `error`,
        });
      }

      function onAborted(): void {
        removeListeners();
        resolve({
          type: `aborted`,
        });
      }

      function onData(chunk: Buffer): void {
        if (totalLength + chunk.length > length) {
          removeListeners();
          resolve({
            type: `tooLong`,
          });
        } else {
          chunks.push(chunk);
          totalLength += chunk.length;
        }
      }

      function onEnd(): void {
        removeListeners();

        if (totalLength < length) {
          resolve({
            type: `tooShort`,
          });
        } else {
          const request = decodeUtf8(Buffer.concat(chunks));
          if (request === null) {
            resolve({
              type: `invalidEncoding`,
            });

            return;
          }

          resolve({
            type: `successful`,
            request,
          });
        }
      }

      instance.request
        .addListener(`error`, onError)
        .addListener(`aborted`, onAborted)
        .addListener(`data`, onData)
        .addListener(`end`, onEnd);
    });
  }

  async respondWithError(
    instance: RespondWithErrorInstance,
    error: neurofoamTypes.ErrorResponse
  ): Promise<void> {
    const statusCode = errorResponseStatusCodeMappings[error];

    if (statusCode !== undefined) {
      await new Promise((resolve) => {
        instance.response.writeHead(statusCode).end(resolve);
      });
    }
  }

  async respond(
    instance: RespondInstance,
    sessionUuidIfNew: null | string,
    response: string
  ): Promise<void> {
    await new Promise((resolve) => {
      if (sessionUuidIfNew === null) {
        instance.response.writeHead(200);
      } else {
        instance.response.writeHead(200, {
          Authorization: `BEARER ${sessionUuidIfNew}`,
        });
      }

      instance.response.end(response, resolve);
    });
  }
}
