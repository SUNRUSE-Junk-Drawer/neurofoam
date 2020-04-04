type FetchedSessionUuid =
  | {
    readonly type: `given`
    readonly sessionUuid: string
  }
  | {
    readonly type: `none`
  }
  | {
    readonly type: `invalid`
  }

export default FetchedSessionUuid
