import * as fs from "fs";
import { processPackage } from "./process-package";
import { writeRootReadme } from "./write-root-readme";

export async function processAll(): Promise<void> {
  await Promise.all([
    processPackage([`neurofoam`]),
    ...(await fs.promises.readdir(`@neurofoam`)).map((name) =>
      processPackage([`@neurofoam`, name])
    ),
  ]);

  await writeRootReadme();
}
