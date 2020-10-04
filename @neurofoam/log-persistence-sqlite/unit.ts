import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid";
import * as neurofoamTypes from "@neurofoam/types";
import { NeurofoamLogPersistenceSqlite } from ".";

describe(`NeurofoamLogPersistenceSqlite`, () => {
  type TestPayloadA = { readonly testPayloadA: `Test Payload A` };
  type TestPayloadB = {
    readonly testPayloadB: `Test Payload B A` | `Test Payload B B`;
  };
  type TestPayloadC = { readonly testPayloadC: `Test Payload C` };

  type TestApplication = neurofoamTypes.Application<
    neurofoamTypes.Json,
    {
      readonly testCommandA: TestPayloadA;
      readonly testCommandB: TestPayloadB;
      readonly testCommandC: TestPayloadC;
    }
  >;

  type Event =
    | {
        readonly type: `insertA`;
        readonly instance: string;
        readonly session: string;
        readonly payload: TestPayloadA;
        readonly date: Date;
      }
    | {
        readonly type: `insertB`;
        readonly instance: string;
        readonly session: string;
        readonly payload: TestPayloadB;
        readonly date: Date;
      }
    | {
        readonly type: `insertC`;
        readonly instance: string;
        readonly session: string;
        readonly payload: TestPayloadC;
        readonly date: Date;
      }
    | {
        readonly type: `get`;
      }
    | {
        readonly type: `reload`;
      };

  function scenario(
    events: ReadonlyArray<Event>,
    expected: ReadonlyArray<{
      readonly instance: string;
      readonly session: string;
      readonly command: `testCommandA` | `testCommandB` | `testCommandC`;
      readonly payload: neurofoamTypes.Json;
      readonly date: Date;
    }>
  ): void {
    describe(`after ${events.map((event) => event.type).join(`, `)}`, () => {
      let databasePath: string;

      let testCommandAApply: jasmine.Spy;
      let testCommandBApply: jasmine.Spy;
      let testCommandCApply: jasmine.Spy;
      let application: TestApplication;

      let neurofoamLogPersistenceSqlite: NeurofoamLogPersistenceSqlite<
        "Test State",
        {
          readonly testCommandA: TestPayloadA;
          readonly testCommandB: TestPayloadB;
          readonly testCommandC: TestPayloadC;
        }
      >;

      beforeAll(async () => {
        testCommandAApply = jasmine.createSpy(`testCommandAApply`);
        testCommandBApply = jasmine.createSpy(`testCommandBApply`);
        testCommandCApply = jasmine.createSpy(`testCommandCApply`);

        application = {
          initialState: `Test State`,
          commands: {
            testCommandA: {
              jsonSchema: {},
              apply: testCommandAApply,
            },
            testCommandB: {
              jsonSchema: {},
              apply: testCommandBApply,
            },
            testCommandC: {
              jsonSchema: {},
              apply: testCommandCApply,
            },
          },
        };

        databasePath = path.join(os.tmpdir(), uuid.v4());

        neurofoamLogPersistenceSqlite = new NeurofoamLogPersistenceSqlite(
          application,
          databasePath
        );

        await neurofoamLogPersistenceSqlite.initialize();

        for (const event of events) {
          switch (event.type) {
            case `insertA`:
              await neurofoamLogPersistenceSqlite.insert.testCommandA(
                event.instance,
                event.session,
                event.payload,
                event.date
              );
              break;

            case `insertB`:
              await neurofoamLogPersistenceSqlite.insert.testCommandB(
                event.instance,
                event.session,
                event.payload,
                event.date
              );
              break;

            case `insertC`:
              await neurofoamLogPersistenceSqlite.insert.testCommandC(
                event.instance,
                event.session,
                event.payload,
                event.date
              );
              break;

            case `get`:
              neurofoamLogPersistenceSqlite.get();
              break;

            case `reload`:
              neurofoamLogPersistenceSqlite = new NeurofoamLogPersistenceSqlite(
                application,
                databasePath
              );

              await neurofoamLogPersistenceSqlite.initialize();
              break;
          }
        }
      });

      afterAll(async () => {
        await fs.promises.rmdir(databasePath, { recursive: true });
      });

      it(`does not apply any states`, () => {
        expect(testCommandAApply).not.toHaveBeenCalled();
        expect(testCommandBApply).not.toHaveBeenCalled();
        expect(testCommandCApply).not.toHaveBeenCalled();
      });

      it(`gets the expected logs`, async () => {
        await expectAsync(neurofoamLogPersistenceSqlite.get()).toBeResolvedTo(
          expected
        );
      });

      it(`wrote the expected database file`, async () => {
        await fs.promises.access(databasePath);
      });
    });
  }

  scenario([], []);
  scenario([{ type: `reload` }], []);

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        type: `insertC`,
        instance: `Test Instance D`,
        session: `Test Session D`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      {
        instance: `Test Instance D`,
        session: `Test Session D`,
        command: `testCommandC`,
        payload: { testPayloadC: `Test Payload C` },
        date: new Date(84583),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `reload`,
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario([{ type: `get` }], []);
  scenario([{ type: `reload` }, { type: `get` }], []);
  scenario([{ type: `get` }, { type: `reload` }], []);

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        type: `insertB`,
        instance: `Test Instance C`,
        session: `Test Session C`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      {
        instance: `Test Instance C`,
        session: `Test Session C`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B B` },
        date: new Date(30333289),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario([{ type: `get` }, { type: `get` }], []);
  scenario([{ type: `reload` }, { type: `get` }, { type: `get` }], []);
  scenario([{ type: `get` }, { type: `reload` }, { type: `get` }], []);
  scenario([{ type: `get` }, { type: `get` }, { type: `reload` }], []);

  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        type: `insertA`,
        instance: `Test Instance B`,
        session: `Test Session B`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      {
        instance: `Test Instance B`,
        session: `Test Session B`,
        command: `testCommandA`,
        payload: { testPayloadA: `Test Payload A` },
        date: new Date(9437593475),
      },
    ]
  );

  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
      { type: `get` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `get` },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario([{ type: `get` }, { type: `get` }, { type: `get` }], []);
  scenario(
    [{ type: `reload` }, { type: `get` }, { type: `get` }, { type: `get` }],
    []
  );
  scenario(
    [{ type: `get` }, { type: `reload` }, { type: `get` }, { type: `get` }],
    []
  );
  scenario(
    [{ type: `get` }, { type: `get` }, { type: `reload` }, { type: `get` }],
    []
  );
  scenario(
    [{ type: `get` }, { type: `get` }, { type: `get` }, { type: `reload` }],
    []
  );

  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `get` },
      {
        type: `insertB`,
        instance: `Test Instance A`,
        session: `Test Session A`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
      { type: `reload` },
    ],
    [
      {
        instance: `Test Instance A`,
        session: `Test Session A`,
        command: `testCommandB`,
        payload: { testPayloadB: `Test Payload B A` },
        date: new Date(39492225),
      },
    ]
  );

  scenario(
    [{ type: `get` }, { type: `get` }, { type: `get` }, { type: `get` }],
    []
  );
  scenario(
    [
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
    ],
    []
  );
  scenario(
    [
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
    ],
    []
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
      { type: `get` },
    ],
    []
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
      { type: `get` },
    ],
    []
  );
  scenario(
    [
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `get` },
      { type: `reload` },
    ],
    []
  );
});
