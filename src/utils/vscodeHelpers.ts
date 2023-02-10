import * as vscode from "vscode";

import { APP_ID } from "../variables";

/**
 * Uri を文字列に変換する
 */
export const toPath = (uri: string | vscode.Uri): string => {
  return typeof uri === "string" ? vscode.Uri.parse(uri).path : uri.path;
};

/**
 * vscode.Uri に変換する
 */
export const toVSCodeUri = (uri: string | vscode.Uri): vscode.Uri => {
  return typeof uri === "string" ? vscode.Uri.parse(uri) : uri;
};

/**
 * Uriからファイル・ディレクトリ名を取得する
 */
export const getFilenameFromUrl = (
  uri: string | vscode.Uri
): string | undefined => {
  const filename = toPath(uri).split("/").slice(-1)[0];
  // toPath()でエンコードされるので、デコードしてから返すようにする
  return filename ? decodeURI(filename) : void 0;
};

/**
 * Uri から親フォルダの Uri を取得する
 */
export const getParentUri = (uri: vscode.Uri): vscode.Uri => {
  const parentUriString = uri.toString().split("/").slice(0, -1).join("/");
  return vscode.Uri.parse(parentUriString);
};

/**
 * 渡された Uri のファイルが存在しているか判定する
 */
export const isExistsUri = async (uri: vscode.Uri): Promise<boolean> => {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
};

/**
 * 一意な vscode.Uri を生成する
 */
export const generateUniqueUri = async (
  generator: () => vscode.Uri
): Promise<vscode.Uri> => {
  let isExists = false;
  let fileUri: vscode.Uri;

  // 一意な Uri を生成する
  do {
    fileUri = generator();
    isExists = await isExistsUri(fileUri);
  } while (isExists);

  return fileUri;
};

/**
 * そのままの`openTextDocument`だと使いにくいので Promise でラップした関数
 */
export const openTextDocument = async (
  uri: vscode.Uri
): Promise<vscode.TextDocument> => {
  return vscode.workspace.openTextDocument(uri);
};

/**
 * WebViewパネルを作成する
 */
export const createWebViewPanel = (title?: string): vscode.WebviewPanel => {
  return vscode.window.createWebviewPanel(
    APP_ID,
    title || "",
    {
      preserveFocus: true,
      viewColumn: vscode.ViewColumn.Two,
    },
    {
      enableScripts: true, // postMessageで通信するのに必要
      retainContextWhenHidden: true, // WebViewがバックグラウンドに移動しても内容を保持するようにする
    }
  );
};

/**
 * ファイルを監視するためのWatcherを作成する
 */
export const createFileSystemWatcher = (
  pattern: vscode.RelativePattern,
  ignore?: { created?: false; updated?: false; deleted?: false }
) => {
  const ignores = [ignore?.created, ignore?.updated, ignore?.deleted] as const;
  return vscode.workspace.createFileSystemWatcher(pattern, ...ignores);
};
