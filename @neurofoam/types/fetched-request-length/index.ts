export type FetchedRequestLength =
  | {
      readonly type: `given`;
      readonly length: number;
    }
  | {
      readonly type: `none`;
    }
  | {
      readonly type: `invalid`;
    };
