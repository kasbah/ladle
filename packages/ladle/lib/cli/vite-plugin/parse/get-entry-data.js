import fs from "fs";
import path from "path";
import debugFactory from "debug";
import { compile } from "@mdx-js/mdx";
import { traverse } from "../babel.js";
import { getFileId } from "../naming-utils.js";
import getAst from "../get-ast.js";
import getDefaultExport from "./get-default-export.js";
import getStorynameAndMeta from "./get-storyname-and-meta.js";
import getNamedExports from "./get-named-exports.js";
import { IMPORT_ROOT } from "../utils.js";

const debug = debugFactory("ladle:vite");

/**
 * @param {string[]} entries
 */
export const getEntryData = async (entries) => {
  /**
   * @type {import('../../../shared/types').EntryData}
   */
  const entryData = {};
  for (let entry of entries) {
    debug(`Parsing ${entry}`);
    entryData[entry] = await getSingleEntry(entry);
  }
  return entryData;
};

/**
 * @param {string} entry
 */
export const getSingleEntry = async (entry) => {
  // fs.promises.readFile is much slower and we don't mind hogging
  // the whole CPU core since this is blocking everything else
  const code = fs.readFileSync(path.join(IMPORT_ROOT, entry), "utf8");
  /** @type {import('../../../shared/types').ParsedStoriesResult} */
  const result = {
    entry,
    stories: [],
    exportDefaultProps: { title: undefined, meta: undefined },
    namedExportToMeta: {},
    namedExportToStoryName: {},
    storyParams: {},
    storySource: code.replace(/\r/g, ""),
    fileId: getFileId(entry),
  };
  console.log(String(await compile(code, { jsx: true })));
  const ast = getAst(String(await compile(code, { jsx: true })), entry);
  console.log(ast);
  traverse(ast, {
    Program: getStorynameAndMeta.bind(this, result),
  });
  traverse(ast, {
    ExportDefaultDeclaration: getDefaultExport.bind(this, result),
  });
  traverse(ast, {
    ExportNamedDeclaration: getNamedExports.bind(this, result),
  });
  debug(`Parsed data for ${entry}:`);
  debug(result);
  return result;
};
