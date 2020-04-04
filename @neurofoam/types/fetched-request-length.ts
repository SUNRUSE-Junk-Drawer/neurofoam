type FetchedRequestLength =
  | {
    readonly type: `given`
    readonly length: number
  }
  | {
    readonly type: `none`
  }

export default FetchedRequestLength
