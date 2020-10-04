import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as sqlite from "sqlite";
import using from ".";

describe(`@neurofoam/persistence-sqlite`, () => {
  describe(`using`, () => {
    describe(`when the file path is invalid`, () => {
      const body = jasmine.createSpy(`body`);
      let thrown: Error;

      beforeAll(async () => {
        try {
          await using(
            `file:${path.join(
              os.tmpdir(),
              `neurofoam-host-temp-d.sqlite`
            )}?vfs=invalid`,
            body
          );
        } catch (e) {
          thrown = e;
        }
      });

      it(`does not call the body callback`, () =>
        expect(body).not.toHaveBeenCalled());
      it(`re-throws the reason thrown by sqlite`, () =>
        expect(thrown.message).toEqual(
          `SQLITE_CANTOPEN: unable to open database file`
        ));
    });

    describe(`when the body callback resolves`, () => {
      let filename: string;
      let body: jasmine.Spy;
      let closedAtTimeOfBodyCallback: boolean;
      let pragmaForeignKeys: undefined | { foreign_keys: 0 | 1 };
      let capturedDatabase: sqlite.Database;
      let result: string;

      beforeAll(async () => {
        filename = path.join(os.tmpdir(), `neurofoam-host-temp-e.sqlite`);

        body = jasmine
          .createSpy(`body`)
          .and.callFake(async (database: sqlite.Database) => {
            capturedDatabase = database;

            try {
              await database.run(`SELECT NULL;`);
              closedAtTimeOfBodyCallback = false;
            } catch {
              closedAtTimeOfBodyCallback = true;
            }

            try {
              pragmaForeignKeys = await database.get(`PRAGMA foreign_keys;`);
            } catch {}

            return `Test Return Value`;
          });

        result = await using(filename, body);
      });

      afterAll(async () => {
        await fs.promises.unlink(filename);
      });

      it(`creates the database file`, () =>
        expectAsync(fs.promises.access(filename)).toBeResolved());
      it(`calls the body callback once`, () =>
        expect(body).toHaveBeenCalledTimes(1));
      it(`had not closed the database at the time of calling the body callback`, () =>
        expect(closedAtTimeOfBodyCallback).toBeFalse());
      it(`had enabled foreign keys at the time of calling the body callback`, () =>
        expect(pragmaForeignKeys).toEqual({ foreign_keys: 1 }));
      it(`returns the result of the body callback`, () =>
        expect(result).toEqual(`Test Return Value`));
      it(`closes the database following the body callback`, () =>
        expectAsync(capturedDatabase.run(`SELECT NULL;`)).toBeRejectedWithError(
          `SQLITE_MISUSE: Database is closed`
        ));
    });

    describe(`when the body callback rejects`, () => {
      let filename: string;
      let body: jasmine.Spy;
      let closedAtTimeOfBodyCallback: boolean;
      let pragmaForeignKeys: undefined | { foreign_keys: 0 | 1 };
      let capturedDatabase: sqlite.Database;
      let thrown: string;

      beforeAll(async () => {
        filename = path.join(os.tmpdir(), `neurofoam-host-temp-f.sqlite`);

        body = jasmine
          .createSpy(`body`)
          .and.callFake(async (database: sqlite.Database) => {
            capturedDatabase = database;

            try {
              await database.run(`SELECT NULL;`);
              closedAtTimeOfBodyCallback = false;
            } catch {
              closedAtTimeOfBodyCallback = true;
            }

            try {
              pragmaForeignKeys = await database.get(`PRAGMA foreign_keys;`);
            } catch {}

            throw `Test Thrown Value`;
          });

        try {
          await using(filename, body);
        } catch (e) {
          thrown = e;
        }
      });

      afterAll(async () => {
        await fs.promises.unlink(filename);
      });

      it(`creates the database file`, () =>
        expectAsync(fs.promises.access(filename)).toBeResolved());
      it(`calls the body callback once`, () =>
        expect(body).toHaveBeenCalledTimes(1));
      it(`had not closed the database at the time of calling the body callback`, () =>
        expect(closedAtTimeOfBodyCallback).toBeFalse());
      it(`had enabled foreign keys at the time of calling the body callback`, () =>
        expect(pragmaForeignKeys).toEqual({ foreign_keys: 1 }));
      it(`re-throws the reason thrown by the body callback`, () =>
        expect(thrown).toEqual(`Test Thrown Value`));
      it(`closes the database following the body callback`, () =>
        expectAsync(capturedDatabase.run(`SELECT NULL;`)).toBeRejectedWithError(
          `SQLITE_MISUSE: Database is closed`
        ));
    });
  });
});
