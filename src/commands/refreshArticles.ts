import { TreeViewContext } from "../context/treeview";

/**
 * `zenn-preview-for-github-dev.refresh-articles`コマンドの実装
 */
export const refreshArticlesCommand = (context: TreeViewContext) => {
  return async () => {
    await context.articleStore.loadArticles(true);
    context.articlesTreeViewProvider.reload();
  };
};
