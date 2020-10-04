export type FetchedBubbleUuid =
  | {
      readonly type: `given`;
      readonly bubbleUuid: string;
    }
  | {
      readonly type: `invalid`;
    };
