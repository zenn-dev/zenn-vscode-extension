import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { ContentError } from "../schemas/error";
import { Contents, ContentsType } from "../types";
import { EMOJI_REGEX } from "../utils/patterns";

/** TreeItem の `contextValue` に設定できる値 */
export type TreeItemType = ContentsType | "error" | "none";

/** `TreeItem.getChildren()` で返すデータ型 */
export type ChildTreeItem = PreviewTreeItem | vscode.TreeItem;

/**
 * TreeItemの基底クラス
 */
export abstract class PreviewTreeItem extends vscode.TreeItem {
  /** ソート時に使うパス文字列 */
  protected readonly path: string;
  protected readonly context: AppContext;
  protected readonly extensionUri: vscode.Uri;

  /** TreeItemをpackage.jsonの設定で判定するための値 */
  contextValue: TreeItemType = "none";

  /** Webviewでプレビューできるか */
  canPreview: boolean = false;

  /** プレビューするコンテンツのUri */
  contentUri?: vscode.Uri;

  constructor(
    context: AppContext,
    content: Contents | ContentError,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super("", collapsibleState);

    this.context = context;
    this.contentUri = content.uri;
    this.resourceUri = content.uri; // VSCode のデフォルトの挙動を有効にするのに必要
    this.path = content.uri?.path || "";
    this.extensionUri = this.context.extension.extensionUri;
  }

  getIconPath(type: string) {
    return {
      dark: vscode.Uri.joinPath(
        this.extensionUri,
        `public/assets/svg/dark/${type}.svg`
      ),
      light: vscode.Uri.joinPath(
        this.extensionUri,
        `public/assets/svg/light/${type}.svg`
      ),
    };
  }

  async getChildren(): Promise<ChildTreeItem[]> {
    return [];
  }

  /**
   * TreeItemをソートする
   */
  static async sortTreeItems(
    items: PreviewTreeItem[]
  ): Promise<PreviewTreeItem[]> {
    // 設定からソート順を取得
    const sortArticle = vscode.workspace
      .getConfiguration("zenn-preview")
      .get<string | null>("sortArticle");

    // 作成日時あるいは更新日時でソート
    if (sortArticle === "created" || sortArticle === "updated") {
      const statsPromises = items.map(async (item) => {
        if (item.contentUri) {
          try {
            const stat = await vscode.workspace.fs.stat(item.contentUri);
            return { path: item.path, stat };
          } catch {
            return { path: item.path, stat: null };
          }
        }
        return { path: item.path, stat: null };
      });
      const statsArray = await Promise.all(statsPromises);
      const statsMap = new Map(statsArray.map((s) => [s.path, s.stat]));

      return items.sort((a, b) => {
        // file stat取得
        const aStat = statsMap.get(a.path);
        const bStat = statsMap.get(b.path);

        if (aStat && bStat) {
          if (sortArticle === "created") {
            return aStat.ctime - bStat.ctime;
          } else { // updated
            return aStat.mtime - bStat.mtime;
          }
        }

        // ファイルの作成・更新時刻が取れなかった場合はpathで比較
        return a.path.localeCompare(b.path, "ja", { sensitivity: "base" });
      });
    }

    return items.sort((a, b) => {
      // 記事タイトルでソート
      if (sortArticle === "title") {
        const getCleanLabel = (item: PreviewTreeItem): string => {
          const labelProp = item.label;
          let labelStr = "";
          if (typeof labelProp === "string") {
            labelStr = labelProp;
          } else if (labelProp && typeof labelProp.label === "string") {
            labelStr = labelProp.label;
          }
          return labelStr.replace(EMOJI_REGEX, "").trim();
        };

        const aCleanLabel = getCleanLabel(a);
        const bCleanLabel = getCleanLabel(b);

        if (aCleanLabel || bCleanLabel) {
          // どちらかに絵文字除去後ラベルがあれば比較
          return aCleanLabel.localeCompare(bCleanLabel, "ja", {
            sensitivity: "base",
          });
        }

        // 絵文字除去後ラベルが両方空の場合はpathで比較 (元々ラベルがなかった場合など)
        return a.path.localeCompare(b.path, "ja", { sensitivity: "base" });
      }

      // ファイルパスでソート
      else {
        return a.path.localeCompare(b.path, "ja", { sensitivity: "base" });
      }
    });
  }
}
