import chokidar from "chokidar";
import * as fs from "fs";
import { Project, ts } from "ts-morph";

const watch = (project: Project, compilerOptions: ts.CompilerOptions): void => {
  const getProjectFilenames = (): string[] => {
    const sourceFiles = project.getSourceFiles();
    return sourceFiles.map((it) => it.getFilePath());
  };

  let filenames = getProjectFilenames();
  const files: ts.MapLike<{ version: number }> = {};

  // initialize the list of files
  filenames.forEach((filename) => {
    console.log(`watching ${filename}`);
    files[filename] = { version: 0 };
  });

  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: (): string[] =>
      project.getSourceFiles().map((it) => it.getFilePath()),
    getScriptVersion: (filename): string =>
      files[filename] && files[filename].version.toString(),
    getScriptSnapshot: (filename) => {
      if (!fs.existsSync(filename)) {
        return undefined;
      }

      return ts.ScriptSnapshot.fromString(fs.readFileSync(filename).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
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

    if (output.emitSkipped) {
      console.log(`Emitting ${filename} failed`);
      logErrors(filename);
    }
  };

  // TODO: use actual path
  console.log(`watching ${process.cwd()}/src`);
  const watcher = chokidar.watch("./src", {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  const addRootDir = (path: string): string => `${process.cwd()}/${path}`;

  watcher
    .on("add", (path) => {
      const fullPath = addRootDir(path);
      console.log(`adding file at path ${path}`);
      project.addSourceFilesFromTsConfig("tsconfig.json");
      files[fullPath] = { version: 0 };
      updateFile(path);
    })
    .on("change", (path) => {
      const fullPath = addRootDir(path);
      console.log(`updating file at path ${path}`);
      const sourceFile = project.getSourceFile(path);
      // TODO: this forgets any nodes associated with this file, handle that
      sourceFile?.refreshFromFileSystemSync();
      console.log(`files[fullPath].version: ${files[fullPath].version}`);
      files[fullPath].version++;
      updateFile(path);
    })
    .on("unlink", (path) => {
      const fullPath = addRootDir(path);
      console.log(`removing file at path ${path}`);
      const sourceFile = project.getSourceFile(path);
      if (sourceFile) project.removeSourceFile(sourceFile);
      delete files[fullPath];
      // TODO: updateFile(path) here?
    })
    .on("addDir", (path) => {
      console.log(`adding dir ${path}`);
      project.addDirectoryAtPath(path);
      // TODO: what to do with files here?
    })
    .on("unlinkDir", (path) => {
      console.log(`removing dir ${path}`);
      // TODO: what to do with files here?
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
