import * as neurofoamTypes from "@neurofoam/types";

export class NeurofoamLogPersistenceMemory<
  TState extends neurofoamTypes.Json,
  TCommands extends {
    readonly [command: string]: neurofoamTypes.Json;
  }
> implements neurofoamTypes.LogPersistence<TCommands> {
  constructor(application: neurofoamTypes.Application<TState, TCommands>) {
    const insert: {
      [command: string]: (
        instance: string,
        session: string,
        payload: neurofoamTypes.Json,
        date: Date
      ) => Promise<void>;
    } = {};

    for (const command in application.commands) {
      insert[command] = async (instance, session, payload, date) => {
        this.entries.push({
          instance,
          session,
          command,
          payload,
          date,
        });
      };
    }

    this.insert = (insert as unknown) as {
      readonly [TCommand in keyof TCommands]: (
        instance: string,
        session: string,
        payload: TCommands[TCommand],
        date: Date
      ) => Promise<void>;
    };
  }

  async initialize(): Promise<void> {
    /* Nothing to initialize. */
  }

  readonly insert: {
    readonly [TCommand in keyof TCommands]: (
      instance: string,
      session: string,
      payload: TCommands[TCommand],
      date: Date
    ) => Promise<void>;
  };

  private readonly entries: {
    readonly instance: string;
    readonly session: string;
    readonly command: keyof TCommands;
    readonly payload: neurofoamTypes.Json;
    readonly date: Date;
  }[] = [];

  get(): ReadonlyArray<{
    readonly instance: string;
    readonly session: string;
    readonly command: keyof TCommands;
    readonly payload: neurofoamTypes.Json;
    readonly date: Date;
  }> {
    return [...this.entries];
  }
}
