type RespondInstanceResponse = {
  writeHead(
    statusCode: number,
    headers?: {
      readonly Authorization: string;
    }
  ): RespondInstanceResponse;
  end(data: string, callback: () => void): RespondInstanceResponse;
};

type RespondInstance = {
  readonly response: RespondInstanceResponse;
};

export default RespondInstance;
