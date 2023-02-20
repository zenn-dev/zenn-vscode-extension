import * as vscode from "vscode";

import { initializeArticleEditor } from "./article";
import { initializeBookEditor } from "./book";
import { initializeBookChapterEditor } from "./bookChapter";
import { initializeBookConfigEditor } from "./bookConfig";
import { initializeBookCoverImageEditor } from "./bookCoverImage";

import { checkUriCanPreview } from "../../schemas/previewPanel";
import { AppContext } from "../app";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: AppContext): vscode.Disposable[] => {
  const { cache, getContentsType, dispatchContentsEvent } = context;

  return [
    ...initializeArticleEditor(context),

    ...initializeBookEditor(context),

    ...initializeBookConfigEditor(context),

    ...initializeBookCoverImageEditor(context),

    ...initializeBookChapterEditor(context),

    // ファイル名が変更されたとき
    vscode.workspace.onDidRenameFiles(async (event) => {
      // キャッシュを削除する
      event.files.forEach(({ oldUri, newUri }) => {
        const oldType = getContentsType(oldUri);
        const newType = getContentsType(newUri);

        if (oldType) cache.deleteCacheWithType(oldType, oldUri);
        if (newType) cache.deleteCacheWithType(newType, newUri);
      });

      // ツリービューなどを更新する
      dispatchContentsEvent({ type: "refresh" });
    }),

    // エディターのフォーカスが変更されたとき
    vscode.window.onDidChangeActiveTextEditor((event) => {
      if (!event || !event.viewColumn) return;

      const activeDocumentUri = event.document.uri;

      // 現在のドキュメントのUriがプレビュー可能なものならエディタタイトル上にプレビューボタンを表示
      const canPreview = checkUriCanPreview(context, activeDocumentUri);
      vscode.commands.executeCommand(
        "setContext",
        "zenn-preview.active-document-can-preview",
        canPreview
      );

      const key = cache.createKey("previewPanel", activeDocumentUri);
      const panel = cache.getCache(key)?.panel;

      if (!panel) return;
      if (event.viewColumn === panel.viewColumn) return;

      // プレビューパネルを開く
      panel.reveal(void 0, true);
    }),
  ];
};
