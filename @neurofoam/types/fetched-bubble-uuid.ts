type FetchedBubbleUuid =
  | {
    readonly type: `given`
    readonly bubbleUuid: string
  }
  | {
    readonly type: `invalid`
  }

export default FetchedBubbleUuid
