import * as vscode from "vscode";

import { GuideTreeItem } from "./guideTreeItem";

import { AppContext } from "../../context/app";
import { createGuideContent, GuideDocsMeta } from "../../schemas/guide";
import { GUIDE_DOCS_META_DATA } from "../../variables";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class GuideTreeViewProvider implements TreeDataProvider {
  private readonly context: AppContext;
  private readonly guideDocsMetaData: GuideDocsMeta[];

  constructor(context: AppContext) {
    this.context = context;
    this.guideDocsMetaData = GUIDE_DOCS_META_DATA;
  }

  async getTreeItem(element: PreviewTreeItem): Promise<PreviewTreeItem> {
    return element;
  }

  async getChildren(element?: PreviewTreeItem): Promise<ChildTreeItem[]> {
    if (element) return element.getChildren();

    const treeItems = this.guideDocsMetaData.map(
      (result) => new GuideTreeItem(this.context, createGuideContent(result))
    );

    return treeItems;
  }
}
