import * as vscode from "vscode";

import { PreviewPanel } from "./previewPanel";
import { BookPreviewContent } from "./types";

import { ZennContext } from "../context/app";
import { BookContent } from "../schemas/book";
import { ZennContents } from "../schemas/types";
import { toPath, createWebViewPanel } from "../utils/vscodeHelpers";

export class BookPreviewPanel extends PreviewPanel<BookPreviewContent> {
  getPanelTitle(contents: BookPreviewContent) {
    const title = contents.book.title || contents.filename || "本";
    return `${title} のプレビュー`;
  }

  createPreviewContent(contents: ZennContents): BookPreviewContent | undefined {
    if (contents.type !== "book") return;
    return BookPreviewPanel.getPreviewContent(
      this.context,
      this.panel,
      contents
    );
  }

  static getPreviewContent(
    context: ZennContext,
    panel: vscode.WebviewPanel,
    content: BookContent
  ): BookPreviewContent {
    const bookChapterStore = context.bookChapterStore;

    return {
      type: "book",
      book: content.value,
      path: toPath(content.uri),
      filename: content.filename,

      // カバー画像のURLをWebView内で表示できる形に変更する
      coverImagePath: content.coverImageUri
        ? panel.webview.asWebviewUri(content.coverImageUri).toString()
        : null,

      // タイトル情報を含めるようにする
      chapters: content.chapters.map((meta) => ({
        slug: meta.slug,
        path: toPath(meta.uri),
        title: bookChapterStore.getBookChapter(meta.uri)?.value.title,
      })),
    };
  }

  static create(context: ZennContext, uri: vscode.Uri) {
    const book = context.bookStore.getBook(uri);

    if (!book) return;

    const panel = createWebViewPanel();
    const contents = BookPreviewPanel.getPreviewContent(context, panel, book);

    return new BookPreviewPanel(context, panel, contents);
  }
}
