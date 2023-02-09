import * as vscode from "vscode";

import { loadArticlePreviewContent } from "./article";
import { loadBookPreviewContent } from "./book";
import { loadBookChapterPreviewContent } from "./bookChapter";
import { ContentError } from "./error";

import { PreviewPanelCacheKey } from "../contentsCache";
import { AppContext } from "../context/app";
import { ContentsType, PreviewContents, PreviewEvent } from "../types";
import { createWebviewHtml, getWebviewSrc } from "../utils/panel";
import {
  toPath,
  toVSCodeUri,
  createWebViewPanel,
} from "../utils/vscodeHelpers";

export interface PreviewPanel {
  uri: vscode.Uri;
  panel: vscode.WebviewPanel;
  cacheKey: PreviewPanelCacheKey;
  defaultContent: PreviewContents;
}

/**
 * プレビューするためのデータを取得する
 */
const loadPreviewContents = (
  context: AppContext,
  uri: vscode.Uri,
  panel: vscode.WebviewPanel
): Promise<PreviewContents | void> => {
  switch (context.getContentsType(uri)) {
    case "article":
      return loadArticlePreviewContent(context, uri, panel);
    case "book":
      return loadBookPreviewContent(context, uri, panel);
    case "bookChapter":
      return loadBookChapterPreviewContent(context, uri, panel);
  }

  return Promise.resolve();
};

/**
 * プレビューパネルを作成する
 */
export const createPreviewPanel = (
  uri: vscode.Uri,
  panel: vscode.WebviewPanel,
  defaultContent: PreviewContents
): PreviewPanel => {
  return {
    uri,
    panel,
    defaultContent,
    cacheKey: `previewPanel:${toPath(uri)}`,
  };
};

/**
 * プレビュー可能な Uri か判別する
 */
export const checkUriCanPreview = (
  context: AppContext,
  uri: vscode.Uri
): boolean => {
  const type = context.getContentsType(uri);
  const canPreviewContentsType: ContentsType[] = [
    "article",
    "book",
    "bookChapter",
  ];

  if (!type || !canPreviewContentsType.includes(type)) {
    return false;
  }
  return true;
};

/**
 * プレビューパネルを表示する
 */
export const openPreviewPanel = async (context: AppContext, path: string) => {
  const uri = toVSCodeUri(path);

  try {
    if (!checkUriCanPreview(context, uri)) {
      throw new ContentError("プレビューできないコンテンツです");
    }

    const cacheKey = context.cache.createKey("previewPanel", uri);
    const cache = context.cache.getCache(cacheKey);
    if (cache) return cache.panel.reveal();

    const panel = createWebViewPanel();
    const content = await loadPreviewContents(context, uri, panel).catch(
      (err) => console.error(err)
    );

    if (!content) {
      panel.dispose();
      throw new ContentError("コンテンツをプレビューできませんでした");
    }

    const previewPanel = createPreviewPanel(uri, panel, content);
    registerPreviewPanel(context, previewPanel);
  } catch (error: unknown) {
    if (error instanceof ContentError) {
      vscode.window.showErrorMessage(error.message);
    }
  }
};

/**
 * 渡されたプレビューパネルに初期化処理をしてキャッシュに保存する
 */
export const registerPreviewPanel = (
  context: AppContext,
  previewPanel: PreviewPanel
) => {
  const { uri, panel, cacheKey, defaultContent } = previewPanel;
  const webviewSrc = getWebviewSrc(panel, context.extension.extensionUri);

  panel.title = defaultContent.panelTitle;
  panel.webview.html = createWebviewHtml(webviewSrc);

  panel.webview.onDidReceiveMessage((event?: PreviewEvent) => {
    if (!event) return;

    if (event.type === "ready-preview-panel") {
      return panel.webview.postMessage({
        type: "ready-preview-panel",
        result: defaultContent,
      });
    }

    context.dispatchContentsEvent(event);
  });

  panel.onDidDispose(() => {
    const event = { type: "dispose-preview-panel", payload: { uri } } as const;
    disposePreviewPanel(context, uri);
    context.dispatchContentsEvent(event);
  });

  context.cache.setCache(cacheKey, previewPanel);
};

/**
 * プレビューの内容を更新する
 */
export const updatePreviewPanel = async (
  context: AppContext,
  uri: vscode.Uri
) => {
  const { cache } = context;
  const key = cache.createKey("previewPanel", uri);
  const previewPanel = cache.getCache(key);

  const content = previewPanel
    ? await loadPreviewContents(context, uri, previewPanel.panel)
    : void 0;

  if (!content) return;

  const panel = previewPanel.panel;

  panel.title = content.panelTitle;
  panel.webview.postMessage({ type: "update-preview-panel", result: content });
  panel.reveal(void 0, true);

  cache.setCache(key, createPreviewPanel(uri, panel, content));
};

/**
 * プレビューパネルを閉じる
 */
export const disposePreviewPanel = async (
  context: AppContext,
  uri: vscode.Uri
) => {
  const { cache } = context;
  const key = cache.createKey("previewPanel", uri);
  const previewPanel = cache.getCache(key);

  if (!previewPanel) return;

  previewPanel.panel.dispose();
  cache.deleteCache(key);
};
