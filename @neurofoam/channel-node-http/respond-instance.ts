type RespondInstanceResponse = {
  writeHead(
    statusCode: number,
    headers?: {
      readonly Authorization: string;
    }
  ): RespondInstanceResponse;
  end(data: string, callback: () => void): RespondInstanceResponse;
};

export type RespondInstance = {
  readonly response: RespondInstanceResponse;
};
