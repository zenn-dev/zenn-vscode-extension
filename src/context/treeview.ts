import * as vscode from "vscode";

import { refreshArticlesCommand } from "../commands/refreshArticles";
import { refreshBooksCommand } from "../commands/refreshBooks";
import { ZennContext } from "../context/app";
import { ArticlesTreeViewProvider } from "../treeview/article/articlesTreeViewProvider";
import { BooksTreeViewProvider } from "../treeview/book/booksTreeViewProvider";
import { APP_COMMAND, TREE_VIEW_ID } from "../variables";

export interface TreeViewContext extends ZennContext {
  booksTreeViewProvider: BooksTreeViewProvider;
  articlesTreeViewProvider: ArticlesTreeViewProvider;
}

/**
 * TreeViewの初期化処理
 */
export const initializeTreeView = (
  context: ZennContext
): vscode.Disposable[] => {
  const { bookStore, articleStore, bookChapterStore } = context;
  const booksTreeViewProvider = new BooksTreeViewProvider(context);
  const articlesTreeViewProvider = new ArticlesTreeViewProvider(context);
  const treeViewContext: TreeViewContext = {
    ...context,
    booksTreeViewProvider,
    articlesTreeViewProvider,
  };

  articleStore.addEventListener((event) => {
    switch (event.type) {
      case "update":
      case "delete":
      case "refresh":
        articlesTreeViewProvider.reload();
        break;
    }
  });

  bookStore.addEventListener((event) => {
    switch (event.type) {
      case "update":
      case "delete":
      case "refresh":
        booksTreeViewProvider.reload();
        break;
    }
  });

  bookChapterStore.addEventListener((event) => {
    switch (event.type) {
      case "update":
      case "delete":
      case "refresh":
        booksTreeViewProvider.reload();
        break;
    }
  });

  return [
    // 記事のTreeView
    vscode.window.createTreeView(TREE_VIEW_ID.ARTICLES, {
      treeDataProvider: articlesTreeViewProvider,
    }),

    // 本のTreeView
    vscode.window.createTreeView(TREE_VIEW_ID.BOOKS, {
      treeDataProvider: booksTreeViewProvider,
    }),

    // 記事一覧を再取得する
    vscode.commands.registerCommand(
      APP_COMMAND.REFRESH_ARTICLES,
      refreshArticlesCommand(treeViewContext)
    ),

    // 本一覧を再取得する
    vscode.commands.registerCommand(
      APP_COMMAND.REFRESH_BOOKS,
      refreshBooksCommand(treeViewContext)
    ),
  ];
};
