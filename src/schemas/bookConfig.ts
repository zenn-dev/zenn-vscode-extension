import * as vscode from "vscode";

import { Book } from "./book";
import { ContentError } from "./error";

import { FileResult } from "../types";
import { parseYaml } from "../utils/helpers";
import { BOOK_CONFIG_FILE_PATTERN } from "../utils/patterns";
import { openTextDocument } from "../utils/vscodeHelpers";

/** Uri内の本の設定ファイル名を置き換えるための正規表現 */
const BOOK_CONFIG_REPLACE_PATTERN = new RegExp(
  `/?${BOOK_CONFIG_FILE_PATTERN.source}$`
);

/**
 * 本の設定Uriから本のUriを取得する
 */
export const getBookUriFromBookConfigUri = (
  bookConfigUri: vscode.Uri
): vscode.Uri => {
  return vscode.Uri.parse(
    bookConfigUri.toString().replace(BOOK_CONFIG_REPLACE_PATTERN, "")
  );
};

type LoadBookConfigResult = { uri: vscode.Uri; value: Book };

/**
 * 本の設定ファイルの値を取得する
 */
export const loadBookConfigData = async (
  bookUri: vscode.Uri,
  files: FileResult[]
): Promise<LoadBookConfigResult | ContentError> => {
  const file = files.find(([n]) => !!n.match(BOOK_CONFIG_FILE_PATTERN))?.[0];
  if (!file) return new ContentError("config.yamlがありません");

  const uri = vscode.Uri.joinPath(bookUri, file);
  const doc = await openTextDocument(uri).catch(() => void 0);
  if (!doc) return new ContentError(`${file}の取得に失敗しました`, uri);

  try {
    const value = parseYaml(doc.getText()) || {};
    return { uri, value };
  } catch {
    return new ContentError(`${file}のフォーマットが不正です`, uri);
  }
};
