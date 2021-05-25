import { Project } from "ts-morph";

const project = new Project();
export const typeChecker = project.getTypeChecker();

export default project;
