type RespondWithErrorInstanceResponse = {
  writeHead(statusCode: number): RespondWithErrorInstanceResponse
  end(callback: Function): RespondWithErrorInstanceResponse
}

type RespondWithErrorInstance = {
  readonly response: RespondWithErrorInstanceResponse
}

export default RespondWithErrorInstance
