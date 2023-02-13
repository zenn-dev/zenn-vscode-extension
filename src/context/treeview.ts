import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { ArticlesTreeViewProvider } from "../treeview/article/articlesTreeViewProvider";
import { BooksTreeViewProvider } from "../treeview/book/booksTreeViewProvider";
import { GuideTreeViewProvider } from "../treeview/guide/guideTreeViewProvider";
import { TREE_VIEW_ID } from "../variables";

/**
 * TreeViewの初期化処理
 */
export const initializeTreeView = (
  context: AppContext
): vscode.Disposable[] => {
  const { listenContentsEvent } = context;
  const booksTreeViewProvider = new BooksTreeViewProvider(context);
  const articlesTreeViewProvider = new ArticlesTreeViewProvider(context);
  const guideTreeViewProvider = new GuideTreeViewProvider(context);

  return [
    listenContentsEvent((event) => {
      switch (event.type) {
        case "refresh":
          articlesTreeViewProvider.reload();
          booksTreeViewProvider.reload();
          break;

        case "refresh-articles":
          articlesTreeViewProvider.reload({ force: true });
          break;

        case "refresh-books":
          booksTreeViewProvider.reload({ force: true });
          break;

        case "create-content":
        case "update-content":
        case "delete-content": {
          const { type } = event.payload;

          if (type === "article") articlesTreeViewProvider.reload();
          else if (type === "book") booksTreeViewProvider.reload();
          else if (type === "bookChapter") booksTreeViewProvider.reload();
          break;
        }
      }
    }),

    // 記事のTreeView
    vscode.window.createTreeView(TREE_VIEW_ID.ARTICLES, {
      treeDataProvider: articlesTreeViewProvider,
    }),

    // 本のTreeView
    vscode.window.createTreeView(TREE_VIEW_ID.BOOKS, {
      treeDataProvider: booksTreeViewProvider,
    }),

    // ガイドのTreeView
    vscode.window.createTreeView(TREE_VIEW_ID.GUIDES, {
      treeDataProvider: guideTreeViewProvider,
    }),
  ];
};
