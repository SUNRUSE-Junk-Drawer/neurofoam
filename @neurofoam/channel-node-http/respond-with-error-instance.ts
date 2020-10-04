type RespondWithErrorInstanceResponse = {
  writeHead(statusCode: number): RespondWithErrorInstanceResponse;
  end(callback: () => void): RespondWithErrorInstanceResponse;
};

export type RespondWithErrorInstance = {
  readonly response: RespondWithErrorInstanceResponse;
};
