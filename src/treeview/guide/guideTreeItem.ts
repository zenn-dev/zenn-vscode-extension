import * as vscode from "vscode";

import { AppContext } from "../../context/app";
import { GuideContent } from "../../schemas/guide";
import { PreviewTreeItem } from "../previewTreeItem";

/**
 * ガイドを表示するTreeItem
 */
export class GuideTreeItem extends PreviewTreeItem {
  readonly canPreview = true;
  readonly contextValue = "guide";
  readonly content: GuideContent;

  constructor(context: AppContext, content: GuideContent) {
    super(context, content, vscode.TreeItemCollapsibleState.None);

    const isBeta = content.value.isBeta;
    this.content = content;

    this.description = isBeta ? "Beta" : "";

    this.label = `${content.value.emoji} ${content.value.title}`;

    this.iconPath = new vscode.ThemeIcon(isBeta ? "map" : "map-filled");
  }
}
