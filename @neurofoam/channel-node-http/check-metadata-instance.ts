type CheckMetadataInstanceRequest = {
  readonly method?: string
  readonly headers: {
    "content-type"?: string
    "accept"?: string
    "content-encoding"?: string
  }
}

type CheckMetadataInstanceResponse = {
  writeHead(statusCode: number): CheckMetadataInstanceResponse
  end(callback: Function): CheckMetadataInstanceResponse
}

type CheckMetadataInstance = {
  readonly request: CheckMetadataInstanceRequest
  readonly response: CheckMetadataInstanceResponse
}

export default CheckMetadataInstance
