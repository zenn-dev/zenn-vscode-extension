import * as vscode from "vscode";

import { PreviewPanel } from "./previewPanel";
import { ArticlePreviewContent } from "./types";

import { ZennContext } from "../context/app";
import { ArticleContent, getArticleTitle } from "../schemas/article";
import { ZennContents } from "../schemas/types";
import { renderMarkdown } from "../utils/markdownHelpers";
import { createWebViewPanel, toPath } from "../utils/vscodeHelpers";

export class ArticlePreviewPanel extends PreviewPanel<ArticlePreviewContent> {
  getPanelTitle(contents: ArticlePreviewContent) {
    const title =
      getArticleTitle({
        emoji: contents.article.emoji,
        title: contents.article.title,
        filename: contents.filename,
      }) || "記事";
    return `${title} のプレビュー`;
  }

  createPreviewContent(
    contents: ZennContents
  ): ArticlePreviewContent | undefined {
    if (contents.type !== "article") return;
    return ArticlePreviewPanel.getPreviewContent(this.panel, contents);
  }

  static getPreviewContent(
    panel: vscode.WebviewPanel,
    content: ArticleContent
  ): ArticlePreviewContent {
    return {
      type: "article",
      article: content.value,
      path: toPath(content.uri),
      filename: content.filename,
      html: renderMarkdown(panel, content.markdown),
    };
  }

  static create(context: ZennContext, uri: vscode.Uri) {
    const panel = createWebViewPanel();
    const article = context.articleStore.getArticle(uri);

    if (!article) return;

    const previewContents = ArticlePreviewPanel.getPreviewContent(
      panel,
      article
    );

    return new ArticlePreviewPanel(context, panel, previewContents);
  }
}
