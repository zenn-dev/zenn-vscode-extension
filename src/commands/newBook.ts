import * as vscode from "vscode";

import { createBookChapterFile } from "./newChapter";

import { AppContext } from "../context/app";
import { generateSlug } from "../utils/helpers";
import { BOOK_SLUG_PATTERN } from "../utils/patterns";
import { isExistsUri } from "../utils/vscodeHelpers";

/**
 * 自動生成される本のチャプターのファイル名
 */
const TEMPLATE_CHAPTERS = ["example1", "example2"];

/**
 * 本の設定ファイルのテンプレート文字列を生成する
 */
const generateBookConfigTemplate = () =>
  [
    `title: ""`,
    `summary: ""`,
    "topics: []",
    `published: false`,
    `price: 0 # 有料の場合200〜5000`,
    `# 本に含めるチャプターを順番に並べましょう`,
    `chapters:`,
    ...TEMPLATE_CHAPTERS.map((filename) => `  - ${filename}`),
  ].join("\n") + "\n";

/**
 * 本の設定ファイルを生成する
 */
const createBookConfigFile = async (
  bookUri: vscode.Uri
): Promise<vscode.Uri> => {
  const configText = new TextEncoder().encode(generateBookConfigTemplate());
  const configUri = vscode.Uri.joinPath(bookUri, "config.yaml");

  await vscode.workspace.fs.writeFile(configUri, configText);

  return configUri;
};

/**
 * 本の作成に基づいてチャプターファイルを作成する
 */
const createBookChapterFiles = async (
  bookUri: vscode.Uri
): Promise<vscode.Uri[]> => {
  const bookChapterFileUris = await Promise.all(
    TEMPLATE_CHAPTERS.map((fileName) =>
      createBookChapterFile(fileName, bookUri)
    )
  );
  return bookChapterFileUris;
};

/**
 * 本の新規作成コマンドの実装
 */
export const newBookCommand = (context?: AppContext) => {
  const generator = async (): Promise<vscode.Uri | null> => {
    if (!context) throw new Error("コマンドを実行できません");

    const bookSlug = await vscode.window.showInputBox({
      value: generateSlug(),
      prompt: "本のslugを入力",
      title: "本の新規作成",
      valueSelection: [0, 14],
      validateInput: async (slug) => {
        if (!BOOK_SLUG_PATTERN.test(slug)) return "不正なslugです";

        const uri = vscode.Uri.joinPath(context.booksFolderUri, slug);
        const isExists = await isExistsUri(uri);

        if (isExists) return "既に存在しているslugです";

        return null;
      },
    });

    if (!bookSlug) return null;

    const bookUri = vscode.Uri.joinPath(context.booksFolderUri, bookSlug);

    await vscode.workspace.fs.createDirectory(bookUri);
    const [configFileUri] = await Promise.all([
      createBookConfigFile(bookUri),
      createBookChapterFiles(bookUri),
    ]);

    return configFileUri;
  };

  return () => {
    generator()
      .then((configFileUri) => {
        if (configFileUri) {
          vscode.window.showInformationMessage("本を作成しました");
          vscode.window.showTextDocument(configFileUri);
        }
      })
      .catch(() => {
        vscode.window.showErrorMessage("本の作成に失敗しました");
      });
  };
};
