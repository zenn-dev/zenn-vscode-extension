import { TreeViewContext } from "../context/treeview";

/**
 * `zenn-preview-for-github-dev.refresh-books`コマンドの実装
 */
export const refreshBooksCommand = (context: TreeViewContext) => {
  return async () => {
    await context.bookStore.loadBooks(true);
    context.booksTreeViewProvider.reload();
  };
};
