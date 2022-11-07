import * as vscode from "vscode";

import { ZennContentBase, ZennContentError, ContentsLoadResult } from "./types";

import { parseFrontMatter } from "../utils/helpers";
import { EMOJI_REGEX, FRONT_MATTER_PATTERN } from "../utils/patterns";
import { getFilenameFromUrl, openTextDocument } from "../utils/vscodeHelpers";

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
export interface ArticleContent extends ZennContentBase {
  type: "article";
  markdown: string;
  value: Article;
}

/**
 * 記事の取得結果
 */
export type ArticleLoadResult = ContentsLoadResult<ArticleContent>;

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
      slug: filename.replace(".md", ""),
      ...parseFrontMatter(text),
    },
    markdown: text.replace(FRONT_MATTER_PATTERN, ""),
  };
};

/**
 * 記事情報を取得する
 */
export const loadArticleContent = async (
  uri: vscode.Uri
): Promise<ArticleLoadResult> => {
  return openTextDocument(uri)
    .then((doc) => createArticleContent(uri, doc.getText()))
    .catch(() => {
      const filename = getFilenameFromUrl(uri) || "記事";
      const message = `${filename}の取得に失敗しました`;

      return new ZennContentError(message, uri);
    });
};

/**
 * 記事一覧情報を取得する
 */
export const loadArticleContents = async (
  uri: vscode.Uri
): Promise<ArticleLoadResult[]> => {
  const files = await vscode.workspace.fs.readDirectory(uri).then((r) =>
    r.flatMap((file) => {
      return file[1] === vscode.FileType.File && file[0].endsWith(".md")
        ? [vscode.Uri.joinPath(uri, file[0])]
        : [];
    })
  );

  return Promise.all(files.map((uri) => loadArticleContent(uri)));
};
