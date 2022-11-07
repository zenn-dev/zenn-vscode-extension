import * as vscode from "vscode";

import { ZennContentError } from "../schemas/types";
import { Subscription } from "../utils/subscription";
import { toPath } from "../utils/vscodeHelpers";

export type StoreEventListener<E> = (event: E) => void;

type CreateStoreEvent<T> =
  | { type: "update"; value: T }
  | { type: "delete"; value: T }
  | { type: "refresh" };

export type StoreEvents = CreateStoreEvent<any>;

export abstract class ContentsStoreBase<T> extends Subscription<
  CreateStoreEvent<T>
> {
  protected readonly store = new Map<string, T>();

  /** StoreのID文字列。getKeyで使用している */
  protected abstract readonly storeId: string;

  /** コンテンツを作成する関数 */
  protected abstract createContent(uri: vscode.Uri, text: string): Promise<T>;

  /** キャッシュを保存するためのKey文字列を返す */
  protected getKey(uri?: vscode.Uri): string {
    const filename = uri && uri.path;
    return filename ? `${this.storeId}:${filename}` : "";
  }

  getItem(key: string): T | undefined {
    return key ? this.store.get(key) : void 0;
  }

  setItem(key: string, value: T) {
    if (!key) return;
    this.store.set(key, value);
  }

  deleteItem(key: string) {
    if (!key) return;
    this.store.delete(key);
  }

  async updateContent(uri: vscode.Uri, text: string) {
    const key = this.getKey(uri);

    if (!key) return;

    const value = await this.createContent(uri, text);

    if (ZennContentError.isError(value)) {
      vscode.window.showErrorMessage("更新に失敗しました");
    }

    this.setItem(key, value);
    this.dispatch({ type: "update", value });
  }

  deleteContent(uri: vscode.Uri) {
    const key = this.getKey(uri);
    const value = this.getItem(key);

    this.deleteItem(key);

    if (value) {
      this.dispatch({ type: "delete", value });
    }
  }
}
