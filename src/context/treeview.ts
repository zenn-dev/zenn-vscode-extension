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

  const articleTreeView = vscode.window.createTreeView(TREE_VIEW_ID.ARTICLES, {
    treeDataProvider: articlesTreeViewProvider,
  });
  const bookTreeView = vscode.window.createTreeView(TREE_VIEW_ID.BOOKS, {
    treeDataProvider: booksTreeViewProvider,
  });
  const guideTreeview = vscode.window.createTreeView(TREE_VIEW_ID.GUIDES, {
    treeDataProvider: guideTreeViewProvider,
  });

  const revealTreeItem = async (uri: vscode.Uri, force?: boolean) => {
    const type = context.getContentsType(uri);

    if (!type) return;

    if (type === "article") {
      const articleTreeItem = articlesTreeViewProvider.getTreeItemFromUri(uri);

      if (!articleTreeItem && force) {
        vscode.window.showErrorMessage(
          "ツリービューアイテムの初期化が完了していないため、ファイルをツリービュー上で表示できませんでした"
        );
        return;
      }

      // ビューセクションが開いている場合か、強制する場合に reveal する
      if (articleTreeItem && (articleTreeView.visible || force)) {
        await articleTreeView.reveal(articleTreeItem);
      }
      return;
    }

    const bookTreeItem = booksTreeViewProvider.getTreeItemFromChildFileUri(uri);

    if (!bookTreeItem && force) {
      return vscode.window.showErrorMessage(
        "ツリービューアイテムの初期化が完了していないため、ファイルをツリービュー上で表示できませんでした"
      );
    }

    // ビューセクションが開いている場合か、強制する場合に BookTreeItem の展開を行う
    if (bookTreeView.visible || force) {
      await bookTreeView.reveal(bookTreeItem, {
        select: false,
        expand: true,
      });
    }

    // NOTE: 画像ファイルを開くのは custom editor であり、アクティブかどうかをグローバルで監視する API が公開されていないため bookCoverImage については TreeItem を reveal できない
    switch (type) {
      case "bookConfig":
        const bookConfigTreeItem =
          booksTreeViewProvider.getChildTreeItemFromChildFileUri(uri);
        if (!bookConfigTreeItem) break;
        await bookTreeView.reveal(bookConfigTreeItem);
        break;

      case "bookChapter":
        const chapterTreeItem =
          booksTreeViewProvider.getChildTreeItemFromChildFileUri(uri);
        if (!chapterTreeItem) break;
        await bookTreeView.reveal(chapterTreeItem);
        break;
    }
  };

  return [
    listenContentsEvent(async (event) => {
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

        case "reveal": {
          const { uri, force } = event.payload;
          await revealTreeItem(uri, force);
          break;
        }
      }
    }),

    // 記事のTreeView
    articleTreeView,

    // 本のTreeView
    bookTreeView,

    // ガイドのTreeView
    guideTreeview,

    vscode.window.onDidChangeActiveTextEditor(async (event) => {
      if (!event || !event.document) return;

      const documentUri = event.document.uri;
      await revealTreeItem(documentUri);
    }),
  ];
};
