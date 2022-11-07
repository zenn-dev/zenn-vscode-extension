import type * as vscode from "vscode";

/**
 * vscode.workspace.fs.readDirectory の返り値の型
 */
export type FileResult = [string, vscode.FileType];

/**
 * 値を廃棄する処理などをする関数
 */
export type Disposal = () => void;
