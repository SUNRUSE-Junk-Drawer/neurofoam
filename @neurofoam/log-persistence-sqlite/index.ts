import * as util from "util";
import * as sqlite3 from "sqlite3";
import * as neurofoamTypes from "@neurofoam/types";

export class NeurofoamLogPersistenceSqlite<
  TState extends neurofoamTypes.Json,
  TCommands extends {
    readonly [command: string]: neurofoamTypes.Json;
  }
> implements neurofoamTypes.LogPersistence<TCommands> {
  constructor(
    application: neurofoamTypes.Application<TState, TCommands>,
    private readonly databasePath: string
  ) {
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
        let database: undefined | sqlite3.Database;

        try {
          database = new sqlite3.Database(this.databasePath);

          await util
            .promisify<string, unknown[], void>(database.run)
            .call(
              database,
              `INSERT INTO log (instance, session, command, payload, date) VALUES (?, ?, ?, ?, ?);`,
              [
                instance,
                session,
                command,
                JSON.stringify(payload),
                date.getTime(),
              ]
            );
        } finally {
          if (database) {
            database.close();
          }
        }
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
    let database: undefined | sqlite3.Database;

    try {
      database = new sqlite3.Database(this.databasePath);
      await util.promisify(database.run).call(
        database,
        `CREATE TABLE IF NOT EXISTS log (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          instance TEXT NOT NULL,
          session TEXT NOT NULL,
          command TEXT NOT NULL,
          payload TEXT NOT NULL,
          date INTEGER NOT NULL
        );`
      );
    } finally {
      if (database) {
        database.close();
      }
    }
  }

  readonly insert: {
    readonly [TCommand in keyof TCommands]: (
      instance: string,
      session: string,
      payload: TCommands[TCommand],
      date: Date
    ) => Promise<void>;
  };

  async get(): Promise<
    ReadonlyArray<{
      readonly instance: string;
      readonly session: string;
      readonly command: keyof TCommands;
      readonly payload: neurofoamTypes.Json;
      readonly date: Date;
    }>
  > {
    let database: undefined | sqlite3.Database;

    try {
      database = new sqlite3.Database(this.databasePath);
      return ((await util
        .promisify(database.all)
        .call(
          database,
          `SELECT instance, session, command, payload, date FROM log ORDER BY id;`
        )) as ReadonlyArray<{
        readonly instance: string;
        readonly session: string;
        readonly command: keyof TCommands;
        readonly payload: string;
        readonly date: number;
      }>).map((row) => ({
        instance: row.instance,
        session: row.session,
        command: row.command,
        payload: JSON.parse(row.payload),
        date: new Date(row.date),
      }));
    } finally {
      if (database) {
        database.close();
      }
    }
  }
}
