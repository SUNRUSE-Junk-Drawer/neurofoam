import * as path from "path"
import runCommandLine from "./run-command-line"

export default async function (
  name: ReadonlyArray<string>,
): Promise<void> {
  console.log(`Installing dependencies...`)
  console.log(await runCommandLine(`npm install --prefix ${path.join.apply(path, name.slice())}`))
}
