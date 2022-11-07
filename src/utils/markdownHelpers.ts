import * as vscode from "vscode";
import markdownToHtml from "zenn-markdown-html";

type Transformer = (panel: vscode.WebviewPanel, markdown: string) => string;

/**
 * <img /> の URL を WebView 内で読み込める形に変換する
 */
export const transformLocalImage: Transformer = (panel, html) => {
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
      new RegExp(`(<img\\s[^>]*src=")/images/[^"]+("[^>]*>)`),
      `$1${url}$2`
    );
  }, html);

  return newHtml;
};

/**
 * Markdown から変換された HTML を `transformer` で変換する
 */
export const transformMarkdownHtml = (
  panel: vscode.WebviewPanel,
  html: string,
  transformers: Transformer[] = [transformLocalImage]
): string => {
  return transformers.reduce(
    (text, transformer) => transformer(panel, text),
    html
  );
};

export const renderMarkdown = (
  panel: vscode.WebviewPanel,
  markdown: string
): string => {
  return transformMarkdownHtml(panel, markdownToHtml(markdown));
};
