import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { generateSlug, pickRandomEmoji } from "../utils/helpers";
import { ARTICLE_SLUG_PATTERN } from "../utils/patterns";
import { generateUniqueUri, isExistsUri } from "../utils/vscodeHelpers";

/**
 * 記事のテンプレート文字列を生成する関数
 */
const generateArticleTemplate = () =>
  [
    "---",
    `title: ""`,
    `emoji: "${pickRandomEmoji()}"`,
    `type: "tech" # tech: 技術記事 / idea: アイデア`,
    "topics: []",
    `published: false`,
    "---",
  ].join("\n") + "\n";

/**
 * 記事の新規作成コマンドの実装
 */
export const newArticleCommand = (context?: AppContext) => {
  const generator = async (): Promise<vscode.Uri | null> => {
    if (!context) throw new Error("コマンドを実行できません");

    const aritcleSlug = await vscode.window.showInputBox({
      value: generateSlug(),
      prompt: "記事のslugを入力",
      title: "記事の新規作成",
      valueSelection: [0, 14],
      validateInput: async (slug) => {
        if (!ARTICLE_SLUG_PATTERN.test(slug)) return "不正なslugです";

        const uri = vscode.Uri.joinPath(
          context.articlesFolderUri,
          `${slug}.md`
        );
        const isExists = await isExistsUri(uri);

        if (isExists) return "既に存在しているslugです";

        return null;
      },
    });

    if (!aritcleSlug) return null;

    const { articlesFolderUri } = context;
    const text = new TextEncoder().encode(generateArticleTemplate());

    const fileUri = await generateUniqueUri(() =>
      vscode.Uri.joinPath(articlesFolderUri, `${aritcleSlug}.md`)
    );

    await vscode.workspace.fs.writeFile(fileUri, text);

    return fileUri;
  };

  return () => {
    generator()
      .then((fileUri) => {
        if (fileUri) {
          vscode.window.showInformationMessage("記事を作成しました");
          vscode.window.showTextDocument(fileUri);
        }
      })
      .catch(() => {
        vscode.window.showErrorMessage("記事の作成に失敗しました");
      });
  };
};
