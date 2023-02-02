import * as vscode from "vscode";

import { GuideTreeItem } from "./guideTreeItem";

import { AppContext } from "../../context/app";
import { createGuideContent } from "../../schemas/guide";
import { GUIDE_DOCS_META_DATA } from "../../variables";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class GuideTreeViewProvider implements TreeDataProvider {
  private readonly context: AppContext;

  constructor(context: AppContext) {
    this.context = context;
  }

  async getTreeItem(element: PreviewTreeItem): Promise<PreviewTreeItem> {
    return element;
  }

  async getChildren(element?: PreviewTreeItem): Promise<ChildTreeItem[]> {
    if (element) return element.getChildren();

    const treeItems = GUIDE_DOCS_META_DATA.map(
      (metadata) =>
        new GuideTreeItem(this.context, createGuideContent(metadata))
    );

    return treeItems;
  }
}
