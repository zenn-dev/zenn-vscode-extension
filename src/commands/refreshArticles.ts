import { AppContext } from "../context/app";

/**
 * `zenn-preview-for-github-dev.refresh-articles`コマンドの実装
 */
export const refreshArticlesCommand = (context: AppContext) => {
  return async () => {
    context.dispatchContentsEvent({ type: "refresh-articles" });
  };
};
