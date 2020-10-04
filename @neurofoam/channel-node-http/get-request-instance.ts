type GetRequestInstanceRequest = {
  addListener(
    event: `error`,
    listener: (err: Error) => void
  ): GetRequestInstanceRequest;
  addListener(
    event: `aborted`,
    listener: () => void
  ): GetRequestInstanceRequest;
  addListener(
    event: `data`,
    listener: (chunk: Buffer) => void
  ): GetRequestInstanceRequest;
  addListener(event: `end`, listener: () => void): GetRequestInstanceRequest;
  addListener(event: `close`, listener: () => void): GetRequestInstanceRequest;

  removeListener(
    event: `error`,
    listener: (err: Error) => void
  ): GetRequestInstanceRequest;
  removeListener(
    event: `aborted`,
    listener: () => void
  ): GetRequestInstanceRequest;
  removeListener(
    event: `data`,
    listener: (chunk: Buffer) => void
  ): GetRequestInstanceRequest;
  removeListener(event: `end`, listener: () => void): GetRequestInstanceRequest;
  removeListener(
    event: `close`,
    listener: () => void
  ): GetRequestInstanceRequest;
};

type GetRequestInstance = {
  readonly request: GetRequestInstanceRequest;
};

export default GetRequestInstance;
