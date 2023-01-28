import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { generateSlug } from "../utils/helpers";
import { BOOK_CHAPTER_SLUG_PATTERN } from "../utils/patterns";
import { isExistsUri } from "../utils/vscodeHelpers";

/**
 * 本のチャプターのテンプレート文字列を生成する
 */
export const generateBookChapterTemplate = () =>
  ["---", 'title: ""', "---"].join("\n") + "\n";

/**
 * 本のチャプターファイルを作成する
 */
export const createBookChapterFile = async (
  filename: string,
  bookUri: vscode.Uri
): Promise<void> => {
  const templateText = generateBookChapterTemplate();
  const chapterText = new TextEncoder().encode(templateText);
  const chapterUri = vscode.Uri.joinPath(bookUri, `${filename}.md`);

  await vscode.workspace.fs.writeFile(chapterUri, chapterText);
};

/**
 * チャプターの新規作成コマンドの実装
 */
export const newChapterCommand = (context?: AppContext) => {
  const generator = async (): Promise<boolean> => {
    if (!context) throw new Error("コマンドを実行できません");

    // 本のフォルダ名を取得
    const bookList = await vscode.workspace.fs
      .readDirectory(context.booksFolderUri)
      .then((result) =>
        result
          .filter((file) => {
            return file[1] === vscode.FileType.Directory;
          })
          .map(([file]) => file)
      );

    // チャプターを作成する本を選択
    const selectedBookFolder = await vscode.window.showQuickPick(bookList, {
      placeHolder: "チャプターを作成する本を選択",
      canPickMany: false,
    });

    if (!selectedBookFolder) return false;

    // チャプタースラグの作成
    const chapterSlug = await vscode.window.showInputBox({
      value: generateSlug(),
      prompt: "チャプターのslugを入力",
      title: "チャプターの新規作成",
      valueSelection: [0, 14],
      validateInput: async (slug) => {
        if (!BOOK_CHAPTER_SLUG_PATTERN.test(slug)) return "不正なslugです";

        const uri = vscode.Uri.joinPath(
          context.booksFolderUri,
          selectedBookFolder,
          `${slug}.md`
        );
        const isExists = await isExistsUri(uri);

        if (isExists) return "既に存在しているslugです";

        return null;
      },
    });

    // チャプタースラグが不正やすでに存在している場合は失敗
    if (!chapterSlug) return false;

    const bookUri = vscode.Uri.joinPath(
      context.booksFolderUri,
      selectedBookFolder
    );

    // ファイルを作成する
    await createBookChapterFile(chapterSlug, bookUri);

    return true;
  };

  return () => {
    generator()
      .then((isCreated) => {
        if (isCreated) {
          vscode.window.showInformationMessage("チャプターを作成しました");
        }
      })
      .catch(() => {
        vscode.window.showErrorMessage("チャプターの作成に失敗しました");
      });
  };
};
