import * as sqlite from "sqlite"
import using from "./using"

export default async function <T>(
  filename: string,
  body: (database: sqlite.Database) => Promise<T>
): Promise<T> {
  return await using(
    filename,
    async database => {
      let transactionOpen = false
      try {
        await database.run(`BEGIN TRANSACTION;`)
        transactionOpen = true

        const result = await body(database)

        await database.run(`COMMIT TRANSACTION;`)
        transactionOpen = false

        return result
      } finally {
        if (transactionOpen) {
          await database.run(`ROLLBACK TRANSACTION;`)
        }
      }
    }
  )
}
