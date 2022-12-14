import * as vscode from "vscode";

import { FileResult } from "../types";
import { BOOK_COVER_IMAGE_FILE_PATTERN } from "../utils/patterns";

/** Uri 内のカバー画像のファイル名を置き換えるための正規表現 */
const BOOK_COVER_IMAGE_REPLSCE_PATTERN = new RegExp(
  `/?${BOOK_COVER_IMAGE_FILE_PATTERN.source}$`
);

/**
 * 本のカバー画像のUriから本のUriを取得する
 */
export const getBookUriFromCoverImageUri = (coverImageUri: vscode.Uri) => {
  return vscode.Uri.parse(
    coverImageUri.toString().replace(BOOK_COVER_IMAGE_REPLSCE_PATTERN, "")
  );
};

/**
 * 本のカバー画像へのUriを返す
 */
export const getBookCoverImageUri = (
  bookUri: vscode.Uri,
  files: FileResult[]
): vscode.Uri | undefined => {
  const coverImage = files.find(
    ([filename]) => !!filename.match(BOOK_COVER_IMAGE_FILE_PATTERN)
  );

  return coverImage && vscode.Uri.joinPath(bookUri, coverImage[0]);
};
