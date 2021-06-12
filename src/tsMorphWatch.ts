import * as fs from "fs";
import R from "ramda";
import { Project, ts } from "ts-morph";

const watch = (project: Project, options: ts.CompilerOptions): void => {
  const getProjectFilenames = (
    options: { lookForRemoved: boolean } = { lookForRemoved: false }
  ): string[] => {
    // FIXME: get the real config path
    project.addSourceFilesFromTsConfig("tsconfig.json");
    const sourceFiles = project.getSourceFiles();

    if (options.lookForRemoved) {
      sourceFiles.forEach((sourceFile) => {
        if (!fs.existsSync(sourceFile.getFilePath())) {
          project.removeSourceFile(sourceFile);
        }
      });

      return project.getSourceFiles().map((it) => it.getFilePath());
    }

    return sourceFiles.map((it) => it.getFilePath());
  };

  let filenames = getProjectFilenames();
  const files: ts.MapLike<{ version: number }> = {};

  const updateFilenames = (): void => {
    console.log("looking for new or removed files in the project...");
    const currentFilenames = getProjectFilenames({ lookForRemoved: true });
    const newFilenames = R.difference(currentFilenames, filenames);
    const removedFilenames = R.difference(filenames, currentFilenames);

    if (newFilenames.length > 0) {
      console.log(`new files:\n${newFilenames.join("\n")}`);
    }

    if (removedFilenames.length > 0) {
      console.log(`removed files:\n${removedFilenames.join("\n")}`);
    }

    newFilenames.forEach((filename) => (files[filename] = { version: 0 }));
    removedFilenames.forEach((filename) => delete files[filename]);

    filenames = currentFilenames;
  };

  // FIXME: there has to be a better way
  setInterval(updateFilenames, 3000);

  // initialize the list of files
  filenames.forEach((filename) => {
    files[filename] = { version: 0 };
  });

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => filenames,
    getScriptVersion: (filename): string =>
      files[filename] && files[filename].version.toString(),
    getScriptSnapshot: (filename) => {
      if (!fs.existsSync(filename)) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(fs.readFileSync(filename).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  const services = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
  );

  const updateFile = (filename: string): void => {
    console.log(`updating ${filename}`);

    let output = services.getEmitOutput(filename);

    if (!output.emitSkipped) {
      console.log(`Emitting ${filename}`);
    } else {
      console.log(`Emitting ${filename} failed`);
      logErrors(filename);
    }
  };

  filenames.forEach((filename) => {
    // First time around, emit all files
    updateFile(filename);

    // Add a watch on the file to handle next change
    fs.watchFile(
      filename,
      { persistent: true, interval: 250 },
      (curr, prev) => {
        // Check timestamp
        if (+curr.mtime <= +prev.mtime) {
          return;
        }

        // Update the version to signal a change in the file
        files[filename].version++;

        // write the changes to disk
        updateFile(filename);
      }
    );
  });

  const logErrors = (fileName: string): void => {
    let allDiagnostics = services
      .getCompilerOptionsDiagnostics()
      .concat(services.getSyntacticDiagnostics(fileName))
      .concat(services.getSemanticDiagnostics(fileName));

    allDiagnostics.forEach((diagnostic) => {
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start!
        );
        console.log(
          `  Error ${diagnostic.file.fileName} (${line + 1},${
            character + 1
          }): ${message}`
        );
      } else {
        console.log(`  Error: ${message}`);
      }
    });
  };
};

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const compilerOptions = ts.convertCompilerOptionsFromJson(
  { module: "commonjs", outDir: "dist" },
  "."
);

watch(project, compilerOptions.options);
