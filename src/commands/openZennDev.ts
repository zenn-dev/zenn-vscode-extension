import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { createZennLinkUri, SlugsForLinkUri } from "../utils/helpers";
import { getFilenameFromUrl, getParentFolderUri } from "../utils/vscodeHelpers";

/**
 * ファイルUriからZenn.dev上のUriを作成する
 */
const createLinkUriString = (context: AppContext, uri: vscode.Uri) => {
  const type = context.getContentsType(uri);
  if (!type) return;

  const filename = getFilenameFromUrl(uri);
  const slug = filename?.split(".md").slice(0, -1)[0];
  const parentFolder = getParentFolderUri(uri)
    .toString()
    .split("/")
    .slice(-1)[0];

  const slugs: SlugsForLinkUri = {
    articleSlug: slug,
    bookSlug: filename,
    chapter: {
      bookSlug: parentFolder,
      chapterSlug: slug,
    },
  };

  return createZennLinkUri(type, slugs);
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
