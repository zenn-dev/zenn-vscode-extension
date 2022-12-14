import * as vscode from "vscode";

import { createFileSystemWatcher } from "../../utils/vscodeHelpers";
import { AppContext } from "../app";

/**
 * 記事のエディターイベントの初期化処理を行う
 */
export const initializeArticleEditor = (
  context: AppContext
): vscode.Disposable[] => {
  const { cache, workspaceUri, dispatchContentsEvent: dispatch } = context;

  // 記事ファイルを監視するためのWatcher
  const articleWatcher = createFileSystemWatcher(
    new vscode.RelativePattern(workspaceUri, "articles/*.md")
  );

  // 記事ファイルが作成された時
  articleWatcher.onDidCreate((uri) => {
    dispatch({ type: "create-content", payload: { type: "article", uri } });
  });

  // 記事ファイルが更新された時
  articleWatcher.onDidChange((uri) => {
    cache.deleteCacheWithType("article", uri);
    dispatch({ type: "update-content", payload: { type: "article", uri } });
  });

  // 記事ファイルが削除された時
  articleWatcher.onDidDelete((uri) => {
    cache.deleteCacheWithType("article", uri);
    dispatch({ type: "delete-content", payload: { type: "article", uri } });
  });

  return [articleWatcher];
};
