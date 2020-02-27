import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import * as sqlite from "sqlite"

import using from "./using"
import usingTransaction from "./using-transaction"

describe(`@neurofoam/persistence-sqlite`, () => {
  describe(`usingTransaction`, () => {
    describe(`when the file path is invalid`, () => {
      let body: jasmine.Spy
      let thrown: Error

      beforeAll(async () => {
        body = jasmine.createSpy(`body`)

        try {
          await usingTransaction(`file:${path.join(os.tmpdir(), `neurofoam-host-temp-g.sqlite`)}?vfs=invalid`, body)
        } catch (e) {
          thrown = e
        }
      })

      it(`does not call the body callback`, () => expect(body).not.toHaveBeenCalled())
      it(`re-throws the reason thrown by sqlite`, () => expect(thrown.message).toEqual(`SQLITE_CANTOPEN: unable to open database file`))
    })

    describe(`when the body callback resolves`, () => {
      let filename: string
      let body: jasmine.Spy
      let closedAtTimeOfBodyCallback: boolean
      let pragmaForeignKeys: { foreign_keys: 0 | 1 }
      let capturedDatabase: sqlite.Database
      let result: string

      beforeAll(async () => {
        filename = path.join(os.tmpdir(), `neurofoam-host-temp-h.sqlite`)

        body = jasmine
          .createSpy(`body`)
          .and
          .callFake(async (database: sqlite.Database) => {
            capturedDatabase = database

            try {
              await database.run(`SELECT NULL;`)
              closedAtTimeOfBodyCallback = false
            } catch {
              closedAtTimeOfBodyCallback = true
            }

            try {
              pragmaForeignKeys = await database.get(`PRAGMA foreign_keys;`)
            } catch {
            }

            await database.run(`INSERT INTO entries (value) VALUES ('Test Entry Value');`)

            return `Test Return Value`
          })

        await using(filename, async database => await database.run(`CREATE TABLE entries ( value TEXT );`))
        result = await usingTransaction(filename, body)
      })

      afterAll(async () => {
        await fs.promises.unlink(filename)
      })

      it(`creates the database file`, () => expectAsync(fs.promises.access(filename)).toBeResolved())
      it(`calls the body callback once`, () => expect(body).toHaveBeenCalledTimes(1))
      it(`had not closed the database at the time of calling the body callback`, () => expect(closedAtTimeOfBodyCallback).toBeFalse())
      it(`had enabled foreign keys at the time of calling the body callback`, () => expect(pragmaForeignKeys).toEqual({ foreign_keys: 1 }))
      it(`returns the result of the body callback`, () => expect(result).toEqual(`Test Return Value`))
      it(`closes the database following the body callback`, () => expectAsync(capturedDatabase.run(`SELECT NULL;`)).toBeRejectedWithError(`SQLITE_MISUSE: Database is closed`))
      it(`did not roll back any changes made`, () => expectAsync(using(filename, database => database.get(`SELECT value FROM entries;`))).toBeResolvedTo({ value: `Test Entry Value` }))
    })

    describe(`when the body callback rejects`, () => {
      let filename: string
      let body: jasmine.Spy
      let closedAtTimeOfBodyCallback: boolean
      let pragmaForeignKeys: { foreign_keys: 0 | 1 }
      let capturedDatabase: sqlite.Database
      let thrown: string

      beforeAll(async () => {
        filename = path.join(os.tmpdir(), `neurofoam-host-temp-i.sqlite`)

        body = jasmine.createSpy(`body`).and.callFake(async (database: sqlite.Database) => {
          capturedDatabase = database

          try {
            await database.run(`SELECT NULL;`)
            closedAtTimeOfBodyCallback = false
          } catch {
            closedAtTimeOfBodyCallback = true
          }

          try {
            pragmaForeignKeys = await database.get(`PRAGMA foreign_keys;`)
          } catch {
          }

          await database.run(`INSERT INTO entries (value) VALUES ('Test Entry Value');`)

          throw `Test Thrown Value`
        })

        await using(filename, async database => await database.run(`CREATE TABLE entries ( value TEXT );`))

        try {
          await usingTransaction(filename, body)
        } catch (e) {
          thrown = e
        }
      })

      afterAll(async () => {
        await fs.promises.unlink(filename)
      })

      it(`creates the database file`, () => expectAsync(fs.promises.access(filename)).toBeResolved())
      it(`calls the body callback once`, () => expect(body).toHaveBeenCalledTimes(1))
      it(`had not closed the database at the time of calling the body callback`, () => expect(closedAtTimeOfBodyCallback).toBeFalse())
      it(`had enabled foreign keys at the time of calling the body callback`, () => expect(pragmaForeignKeys).toEqual({ foreign_keys: 1 }))
      it(`re-throws the reason thrown by the body callback`, () => expect(thrown).toEqual(`Test Thrown Value`))
      it(`closes the database following the body callback`, () => expectAsync(capturedDatabase.run(`SELECT NULL;`)).toBeRejectedWithError(`SQLITE_MISUSE: Database is closed`))
      it(`rolled back any changes made`, () => expectAsync(using(filename, database => database.get(`SELECT value FROM entries;`))).toBeResolvedTo(undefined))
    })
  })
})
