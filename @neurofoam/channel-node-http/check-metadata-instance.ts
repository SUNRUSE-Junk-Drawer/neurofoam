type CheckMetadataInstanceRequest = {
  readonly method?: string
  readonly headers: {
    "content-type"?: string
    "content-encoding"?: string
    "accept"?: string
    "accept-charset"?: string
    "accept-encoding"?: string
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
