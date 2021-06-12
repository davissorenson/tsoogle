import * as fs from "fs";
import { Project, ts } from "ts-morph";

const watch = (filenames: string[], options: ts.CompilerOptions): void => {
  const files: ts.MapLike<{ version: number }> = {};

  // initialize the list of files
  filenames.forEach((filename) => {
    files[filename] = { version: 0 };
  });

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => filenames,
    getScriptVersion: (filename) =>
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
const sourceFilenames = project
  .getSourceFiles()
  .map((it) => it.getFilePath().toString());

console.log(`Watching ${sourceFilenames.join("\n")}`);
const compilerOptions = ts.convertCompilerOptionsFromJson(
  { module: "commonjs", outDir: "dist" },
  "."
);
console.log(compilerOptions);

watch(sourceFilenames, compilerOptions.options);
