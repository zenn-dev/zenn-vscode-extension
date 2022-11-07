import * as vscode from "vscode";

import { PreviewPanel } from "./previewPanel";
import { BookChapterPreviewContents } from "./types";

import { ZennContext } from "../context/app";
import { BookChapterContent } from "../schemas/bookChapter";
import { ZennContentError, ZennContents } from "../schemas/types";
import { renderMarkdown } from "../utils/markdownHelpers";
import { createWebViewPanel, toPath } from "../utils/vscodeHelpers";

export class BookChapterPreviewPanel extends PreviewPanel<BookChapterPreviewContents> {
  getPanelTitle(contents: BookChapterPreviewContents) {
    const title = contents.chapter.title || contents.filename || "チャプター";
    return `${title} のプレビュー`;
  }

  createPreviewContent(
    content: ZennContents
  ): BookChapterPreviewContents | undefined {
    if (content.type !== "bookChapter") return;
    return BookChapterPreviewPanel.getPreviewContent(
      this.context,
      this.panel,
      content
    );
  }

  static getPreviewContent(
    context: ZennContext,
    panel: vscode.WebviewPanel,
    content: BookChapterContent
  ): BookChapterPreviewContents | undefined {
    const book = context.bookStore.getBook(content.bookUri);

    if (!book || ZennContentError.isError(book)) return;

    return {
      type: "bookChapter",
      book: book.value,
      chapter: content.value,
      path: toPath(content.uri),
      filename: content.filename,
      bookPath: toPath(book.uri),
      bookFilename: book.filename,
      html: renderMarkdown(panel, content.markdown),
    };
  }

  static create(context: ZennContext, uri: vscode.Uri) {
    const chapter = context.bookChapterStore.getBookChapter(uri);

    if (!chapter) return;

    const panel = createWebViewPanel();
    const contents = BookChapterPreviewPanel.getPreviewContent(
      context,
      panel,
      chapter
    );

    if (!contents) {
      panel.dispose(); // パネルは表示しないので削除する
      return;
    }

    return new BookChapterPreviewPanel(context, panel, contents);
  }
}
