type CheckMetadataInstanceResponse = {
  readonly method?: string
  readonly headers: {
    "content-type"?: string
    "accept"?: string
    "content-encoding"?: string
  }
  writeHead(statusCode: number): CheckMetadataInstanceResponse
  end(callback: Function): CheckMetadataInstanceResponse
}

type CheckMetadataInstance = {
  readonly request: CheckMetadataInstanceResponse
}

export default CheckMetadataInstance
