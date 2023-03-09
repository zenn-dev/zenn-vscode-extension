import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { getFilenameFromUrl, getParentFolderUri } from "../utils/vscodeHelpers";
import { ZENN_LINK_BASE_URL } from "../variables";

/**
 * ファイルUriからZenn.dev上のUriを作成する
 */
const createLinkUriString = (context: AppContext, uri: vscode.Uri) => {
  const type = context.getContentsType(uri);
  const filename = getFilenameFromUrl(uri);
  const slug = filename?.split(".md").slice(0, -1)[0];
  const parent = getParentFolderUri(uri).toString().split("/").slice(-1);

  const linkUriString = (() => {
    switch (type) {
      case "article":
        return `${ZENN_LINK_BASE_URL}/articles/${slug}`;
      case "book":
        return `${ZENN_LINK_BASE_URL}/books/${filename}`;
      case "bookConfig":
        return `${ZENN_LINK_BASE_URL}/books/${parent}`;
      case "bookChapter":
        return `${ZENN_LINK_BASE_URL}/books/${parent}?chapter_slug=${slug}`;
    }
  })();

  return linkUriString;
};

/**
 * Zenn.dev上でコンテンツを開くコマンドの実装
 */
export const openZennDevCommand = (context?: AppContext) => {
  return () => {
    if (!context) {
      return vscode.window.showErrorMessage("コマンドの実行に失敗しました");
    }

    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;

    if (!activeDocumentUri) {
      return vscode.window.showErrorMessage(
        "アクセス可能なコンテンツではありません"
      );
    }

    const linkUriString = createLinkUriString(context, activeDocumentUri);

    if (!linkUriString) {
      return vscode.window.showErrorMessage(
        "アクセス可能なコンテンツではありません"
      );
    }

    vscode.env.openExternal(vscode.Uri.parse(linkUriString));
  };
};
