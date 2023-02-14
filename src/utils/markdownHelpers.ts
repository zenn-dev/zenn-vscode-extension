import * as vscode from "vscode";
import ZennMarkdownToHtml from "zenn-markdown-html";

import { createWebViewPanel } from "./vscodeHelpers";

type Transformer = (markdown: string) => string;

/**
 * <img /> の URL を WebView 内で読み込める形に変換する
 */
export const transformLocalImage =
  (panel: vscode.WebviewPanel): Transformer =>
  (html) => {
    const imgPattern = /<img\s[^>]*src="(\/images\/[^"]+)"[^>]*>/gm;
    const root = vscode.workspace.workspaceFolders?.[0].uri;
    const matches = [...html.matchAll(imgPattern)];
    const srcList = [...new Set(matches.map(([, url]) => url))];

    if (!root || !srcList.length) return html;

    // img タグの src を変換する
    const newHtml = srcList.reduce((htmlText, src) => {
      const imageUri = vscode.Uri.joinPath(root, src);
      const url = panel.webview.asWebviewUri(imageUri);

      return htmlText.replace(
        new RegExp(`(<img\\s[^>]*src=")/images/[^"]+("[^>]*>)`, "g"),
        `$1${url}$2`
      );
    }, html);

    return newHtml;
  };

/**
 * Markdown を HTML に変換する
 */
export const markdownToHtml = (
  markdown: string,
  panel: vscode.WebviewPanel
): string => {
  return [transformLocalImage(panel)].reduce(
    (text, transformer) => transformer(text),
    ZennMarkdownToHtml(markdown)
  );
};
