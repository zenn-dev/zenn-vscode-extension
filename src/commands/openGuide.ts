import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { GuideTreeItem } from "../treeview/guide/guideTreeItem";
import { GUIDE_DOCS_META_DATA, GUIDE_DOCS_BASE_URL } from "../variables";

/**
 * ガイドを開くコマンドの実装
 */
export const openGuideCommand = (context?: AppContext) => {
  return async (treeItem?: GuideTreeItem): Promise<boolean> => {
    if (!context) throw new Error("コマンドを実行できません");

    const guideList = GUIDE_DOCS_META_DATA.map(
      ({ emoji, title }) => `${emoji} ${title}`
    );

    // コマンドパレットから実行する場合はガイドをリストから選択して開く
    const selectedGuideDocsMeta =
      treeItem?.content?.value ||
      (await vscode.window
        .showQuickPick(guideList, {
          placeHolder: "開くガイドを選択",
          canPickMany: false,
        })
        .then((result) => {
          return GUIDE_DOCS_META_DATA.find(
            ({ emoji, title }) => `${emoji} ${title}` === result
          );
        }));

    if (!selectedGuideDocsMeta) return false;

    const { slug, hash } = selectedGuideDocsMeta;
    const docsUrl = GUIDE_DOCS_BASE_URL.docsUrl;
    const url = (() => {
      if (!hash) {
        return `${docsUrl}${slug}`;
      } else {
        return `${docsUrl}${slug}#${hash}`;
      }
    })();

    // ブラウザで開く
    await vscode.env.openExternal(vscode.Uri.parse(url));
    return true;
  };
};
