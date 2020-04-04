type RespondInstanceResponse = {
  writeHead(statusCode: number, headers: {
    readonly Authorization?: string
  }): RespondInstanceResponse
  end(data: string, callback: Function): RespondInstanceResponse
}

type RespondInstance = {
  readonly response: RespondInstanceResponse
}

export default RespondInstance