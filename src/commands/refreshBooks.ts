import { AppContext } from "../context/app";

/**
 * `zenn-preview-for-github-dev.refresh-books`コマンドの実装
 */
export const refreshBooksCommand = (context: AppContext) => {
  return async () => {
    context.dispatchContentsEvent({ type: "refresh-articles" });
  };
};
