import * as path from "path";
import * as neurofoamTypes from "@neurofoam/types";

import using from "./using";
import usingTransaction from "./using-transaction";

export default class<
  TState extends neurofoamTypes.Json,
  TEvent extends neurofoamTypes.Json
> implements neurofoamTypes.Persistence<TState, TEvent> {
  constructor(private readonly filename: string) {}

  async initialize(): Promise<void> {
    await using(this.filename, (database) =>
      database.migrate({ migrationsPath: path.join(__dirname, `migrations`) })
    );
  }

  async getBubble(
    bubbleUuid: string
  ): Promise<null | {
    readonly currentState: TState;
    readonly latestEventUuid: string;
  }> {
    return await using(this.filename, async (database) => {
      const result = await database.get<{
        readonly currentStateJson: string;
        readonly latestEventUuid: string;
      }>(
        `SELECT currentStateJson, latestEventUuid FROM bubbles WHERE bubbleUuid = ? LIMIT 1;`,
        [bubbleUuid]
      );

      if (result === undefined) {
        return null;
      }

      return {
        currentState: JSON.parse(result.currentStateJson),
        latestEventUuid: result.latestEventUuid,
      };
    });
  }

  async recordFirstEvent(
    bubbleUuid: string,
    eventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<neurofoamTypes.PersistenceResult> {
    return await usingTransaction(this.filename, async (database) => {
      try {
        await database.run(
          `INSERT INTO bubbles (bubbleUuid, currentStateJson) VALUES (?, ?);`,
          [bubbleUuid, JSON.stringify(resultingState)]
        );
      } catch (e) {
        if (
          e.message ===
          `SQLITE_CONSTRAINT: UNIQUE constraint failed: bubbles.bubbleUuid`
        ) {
          return `optimisticConcurrencyControlCollision`;
        }

        throw e;
      }

      await database.run(
        `INSERT INTO events (eventUuid, bubbleUuid, sessionUuid, eventJson, recorded) VALUES (?, ?, ?, ?, ?);`,
        [eventUuid, bubbleUuid, sessionUuid, JSON.stringify(event), +new Date()]
      );

      await database.run(
        `UPDATE bubbles SET latestEventUuid = ? WHERE bubbleUuid = ?;`,
        [eventUuid, bubbleUuid]
      );

      return `successful`;
    });
  }

  async recordSubsequentEvent(
    bubbleUuid: string,
    previousEventUuid: string,
    nextEventUuid: string,
    sessionUuid: string,
    event: TEvent,
    resultingState: TState
  ): Promise<neurofoamTypes.PersistenceResult> {
    return await usingTransaction(this.filename, async (database) => {
      await database.run(
        `INSERT INTO events (eventUuid, previousEventUuid, bubbleUuid, sessionUuid, eventJson, recorded) VALUES (?, ?, ?, ?, ?, ?);`,
        [
          nextEventUuid,
          previousEventUuid,
          bubbleUuid,
          sessionUuid,
          JSON.stringify(event),
          +new Date(),
        ]
      );

      const rows = (
        await database.run(
          `UPDATE bubbles SET currentStateJson = ?, latestEventUuid = ? WHERE bubbleUuid = ? AND latestEventUuid = ?;`,
          [
            JSON.stringify(resultingState),
            nextEventUuid,
            bubbleUuid,
            previousEventUuid,
          ]
        )
      ).changes;

      if (rows !== 1) {
        return `optimisticConcurrencyControlCollision`;
      }

      return `successful`;
    });
  }
}
