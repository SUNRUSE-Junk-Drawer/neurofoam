import { Json } from "../json";

export type LogPersistence<
  TCommands extends { readonly [command: string]: Json }
> = {
  initialize(): Promise<void>;

  readonly insert: {
    readonly [TCommand in keyof TCommands]: (
      instance: string,
      session: string,
      request: TCommands[TCommand]
    ) => Promise<void>;
  };
};
