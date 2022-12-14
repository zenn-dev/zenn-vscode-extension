import * as vscode from "vscode";

/**
 * コンテンツのエラーを扱うクラス
 */
export class ContentError extends Error {
  readonly uri?: vscode.Uri;

  constructor(message: string, uri?: vscode.Uri) {
    super(message);

    this.uri = uri;
  }

  static isError(value: unknown): value is ContentError {
    return value instanceof ContentError;
  }
}
