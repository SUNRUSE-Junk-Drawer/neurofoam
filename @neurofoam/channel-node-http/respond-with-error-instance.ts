type RespondWithErrorInstanceResponse = {
  writeHead(statusCode: number): RespondWithErrorInstanceResponse;
  end(callback: () => void): RespondWithErrorInstanceResponse;
};

type RespondWithErrorInstance = {
  readonly response: RespondWithErrorInstanceResponse;
};

export default RespondWithErrorInstance;
