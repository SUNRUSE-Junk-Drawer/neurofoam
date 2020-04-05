import * as sqlite from "sqlite"
import * as sqlite3 from "sqlite3"

export default async function <T>(
  filename: string,
  body: (database: sqlite.Database) => Promise<T>
): Promise<T> {
  let database: null | sqlite.Database = null
  try {
    database = await sqlite.open({
      filename,
      driver: sqlite3.Database,
    })
    await database.run(`PRAGMA foreign_keys = ON;`)
    return await body(database)
  } finally {
    if (database !== null) {
      await database.close()
    }
  }
}
