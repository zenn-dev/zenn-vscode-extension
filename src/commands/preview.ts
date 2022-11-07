import { WebViewContext } from "../context/webview";
import { PreviewTreeItem } from "../treeview/previewTreeItem";

/**
 * レビューコマンドの実装
 */
export const previewCommand = (context?: WebViewContext) => {
  return (treeItem?: PreviewTreeItem) => {
    if (!context) return;
    if (!treeItem?.canPreview) return;
    if (!treeItem.contentUri) return;

    context.openPreviewPanel(treeItem.contentUri);
  };
};
