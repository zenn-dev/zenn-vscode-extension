import * as vscode from "vscode";

import { ZennContext } from "../context/app";
import { ArticlePreviewPanel } from "../panels/articlePreviewPanel";
import { BookChapterPreviewPanel } from "../panels/bookChapterPreviewPanel";
import { BookPreviewPanel } from "../panels/bookPreviewPanel";
import { PreviewPanel } from "../panels/previewPanel";
import { ZennPreviewContents } from "../panels/types";
import { ZennContents } from "../schemas/types";
import { Subscription } from "../utils/subscription";
import { toVSCodeUri } from "../utils/vscodeHelpers";

type PreviewPanelStoreEvent = {
  type: "OPEN_PREVIEW";
  payload: { openPath: string };
  result?: never;
};

export class PreviewPanelStore extends Subscription<PreviewPanelStoreEvent> {
  readonly storeId = "panels";

  private readonly store = new Map<string, PreviewPanel>();

  private getKey(path?: vscode.Uri | string): string {
    return path ? `${this.storeId}:${toVSCodeUri(path).path}` : "";
  }

  createPreviewPanelFromContents(
    context: ZennContext,
    uri: vscode.Uri
  ): PreviewPanel | undefined {
    const type = context.getZennContentsType(uri);

    switch (type) {
      case "article":
        return ArticlePreviewPanel.create(context, uri);
      case "book":
        return BookPreviewPanel.create(context, uri);
      case "bookChapter":
        return BookChapterPreviewPanel.create(context, uri);
    }
  }

  createPreviewPanelFromPreviewContents(
    context: ZennContext,
    panel: vscode.WebviewPanel,
    contents: ZennPreviewContents
  ): PreviewPanel | undefined {
    switch (contents.type) {
      case "article":
        return new ArticlePreviewPanel(context, panel, contents);
      case "book":
        return new BookPreviewPanel(context, panel, contents);
      case "bookChapter":
        return new BookChapterPreviewPanel(context, panel, contents);
    }
  }

  getPanel(uri?: vscode.Uri): PreviewPanel | undefined {
    const key = this.getKey(uri);
    return key ? this.store.get(key) : void 0;
  }

  setPanel(panel: PreviewPanel) {
    const contents = panel.getPreviewContents();
    const key = this.getKey(contents.path);

    if (this.store.has(key)) return;

    const dispose = panel.addEventListener((event) => {
      switch (event.type) {
        case "DISPOSE":
          dispose();
          this.store.delete(key);
          break;
        case "OPEN_PREVIEW":
          this.dispatch(event);
          break;
      }
    });

    this.store.set(key, panel);
  }

  updatePreview(contents: ZennContents) {
    const panel = this.getPanel(contents.uri);
    panel?.updatePreview(contents);
  }

  disposePanel(contents: ZennContents) {
    const panel = this.getPanel(contents.uri);
    panel?.dispose();
  }
}
