import * as vscode from "vscode";

import { ContentError } from "./error";
import { withCache } from "./utils";

import { AppContext } from "../context/app";
import { ContentBase, ContentsLoadResult, PreviewContentBase } from "../types";
import { parseFrontMatter } from "../utils/helpers";
import { markdownToHtml } from "../utils/markdownHelpers";
import { EMOJI_REGEX, FRONT_MATTER_PATTERN } from "../utils/patterns";
import {
  getFilenameFromUrl,
  openTextDocument,
  toFullPath,
} from "../utils/vscodeHelpers";

/**
 * 記事のメタ情報
 */
export interface Article {
  slug?: string;
  type?: "tech" | "idea";
  title?: string;
  emoji?: string;
  topics?: string[];
  published?: boolean;
  published_at?: string;
  publication_name?: string;
}

/**
 * 記事の情報を含んだ型
 */
export interface ArticleContent extends ContentBase {
  type: "article";
  markdown: string;
  value: Article;
}

/**
 * 記事の取得結果
 */
export type ArticleLoadResult = ContentsLoadResult<ArticleContent>;

/** 記事のプレビュー時(postMessage)に使うデータ型 */
export interface ArticlePreviewContent extends PreviewContentBase {
  type: "article";
  html: string;
  article: Article;
}

/**
 * 記事のタイトルを返す
 * TODO: emoji にバリデーションをかける
 */
export const getArticleTitle = ({
  emoji,
  title,
  filename,
}: {
  emoji?: string;
  title?: string;
  filename?: string;
}): string => {
  const emojiStr = !!emoji?.match(EMOJI_REGEX) ? `${emoji} ` : "";

  if (title) return `${emojiStr}${title}`;
  if (filename) return `${emojiStr}${filename}`;

  return "タイトルが設定されていません";
};

/**
 * 引数から記事データを作成する
 */
export const createArticleContent = (
  uri: vscode.Uri,
  text: string
): ArticleContent => {
  const filename = getFilenameFromUrl(uri) || "";

  return {
    uri,
    filename,
    type: "article",
    value: {
      ...parseFrontMatter(text),
      slug: filename.replace(".md", ""),
    },
    markdown: text.replace(FRONT_MATTER_PATTERN, ""),
  };
};

/**
 * 記事情報を取得する
 */
export const loadArticleContent = withCache(
  ({ cache }, uri) => cache.createKey("article", uri),

  async (uri): Promise<ArticleLoadResult> => {
    return openTextDocument(uri)
      .then((doc) => createArticleContent(uri, doc.getText()))
      .catch(() => {
        const filename = getFilenameFromUrl(uri) || "記事";
        const message = `${filename}の取得に失敗しました`;

        return new ContentError(message, uri);
      });
  }
);

/**
 * 記事一覧情報を取得する
 */
export const loadArticleContents = async (
  context: AppContext,
  force?: boolean
): Promise<ArticleLoadResult[]> => {
  const rootUri = context.articlesFolderUri;

  const files = await vscode.workspace.fs.readDirectory(rootUri).then((r) =>
    r.flatMap((file) => {
      return file[1] === vscode.FileType.File && file[0].endsWith(".md")
        ? [vscode.Uri.joinPath(rootUri, file[0])]
        : [];
    })
  );

  return Promise.all(
    files.map((uri) => loadArticleContent(context, uri, force))
  );
};

export const loadArticlePreviewContent = async (
  context: AppContext,
  uri: vscode.Uri,
  panel: vscode.WebviewPanel
): Promise<ArticlePreviewContent> => {
  const article = await loadArticleContent(context, uri);

  if (ContentError.isError(article)) throw article;

  return {
    type: "article",
    article: article.value,
    fullPath: toFullPath(uri),
    filename: article.filename,
    html: markdownToHtml(article.markdown, panel),
    panelTitle: `${
      getArticleTitle({
        emoji: article.value.emoji,
        title: article.value.title,
        filename: article.filename,
      }) || "記事"
    } のプレビュー`,
  };
};
