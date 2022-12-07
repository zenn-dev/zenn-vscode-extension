import * as vscode from "vscode";

import { FileResult } from "../types";
import { BOOK_COVER_IMAGE_PATTERN } from "../utils/patterns";

/**
 * 本のカバー画像のUriから本のUriを取得する
 */
export const getBookUriFromCoverImageUri = (coverImageUri: vscode.Uri) => {
  return vscode.Uri.parse(
    coverImageUri.toString().replace(BOOK_COVER_IMAGE_PATTERN, "")
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
    ([filename]) => !!filename.match(BOOK_COVER_IMAGE_PATTERN)
  );

  return coverImage && vscode.Uri.joinPath(bookUri, coverImage[0]);
};
