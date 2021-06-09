import { Project } from "ts-morph";

const project = new Project({ useInMemoryFileSystem: true });
export const typeChecker = project.getTypeChecker();

export default project;
