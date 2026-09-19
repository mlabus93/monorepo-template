import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const outputDirectory = path.join(
  repositoryRoot,
  "packages/vitest-config/coverage/merged-blob",
);

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

let reportCount = 0;

for (const workspaceGroup of ["apps", "packages"]) {
  const groupDirectory = path.join(repositoryRoot, workspaceGroup);
  const workspaces = await readdir(groupDirectory, { withFileTypes: true });

  for (const workspace of workspaces) {
    if (!workspace.isDirectory()) continue;

    const blobDirectory = path.join(
      groupDirectory,
      workspace.name,
      "coverage/blob",
    );

    let blobFiles;
    try {
      blobFiles = await readdir(blobDirectory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }

    for (const blobFile of blobFiles) {
      if (!blobFile.isFile() || !blobFile.name.endsWith(".json")) continue;

      const destinationName = `${workspaceGroup}-${workspace.name}-${blobFile.name}`;
      await cp(
        path.join(blobDirectory, blobFile.name),
        path.join(outputDirectory, destinationName),
      );
      reportCount += 1;
    }
  }
}

if (reportCount === 0) {
  throw new Error("No Vitest blob reports were found. Run `pnpm test` first.");
}

console.log(`Staged ${reportCount} Vitest blob reports.`);
