type FetchedRequest =
  | {
      readonly type: `successful`;
      readonly request: string;
    }
  | {
      readonly type: `tooLong`;
    }
  | {
      readonly type: `tooShort`;
    }
  | {
      readonly type: `invalidEncoding`;
    }
  | {
      readonly type: `aborted`;
    }
  | {
      readonly type: `error`;
    };

export default FetchedRequest;
