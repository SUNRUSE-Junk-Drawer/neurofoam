import * as jsonschema from "jsonschema";
import { Json } from "../json";

export type Application<
  TState extends Json,
  TCommands extends { readonly [command: string]: Json }
> = {
  readonly initialState: TState;

  readonly commands: {
    readonly [TCommand in keyof TCommands]: {
      readonly jsonSchema: jsonschema.Schema;

      apply(
        state: TState,
        command: TCommands[TCommand],
        sessionUuid: string
      ): TState;
    };
  };
};
