import { readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

for (const workspaceGroup of ["apps", "packages"]) {
  const groupDirectory = path.join(repositoryRoot, workspaceGroup);
  const workspaces = await readdir(groupDirectory, { withFileTypes: true });

  await Promise.all(
    workspaces
      .filter((workspace) => workspace.isDirectory())
      .map((workspace) =>
        rm(path.join(groupDirectory, workspace.name, "coverage/blob"), {
          recursive: true,
          force: true,
        }),
      ),
  );
}

console.log("Cleaned Vitest blob reports.");
