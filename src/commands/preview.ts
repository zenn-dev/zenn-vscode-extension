import { AppContext } from "../context/app";
import { PreviewTreeItem } from "../treeview/previewTreeItem";

/**
 * レビューコマンドの実装
 */
export const previewCommand = (context?: AppContext) => {
  return (treeItem?: PreviewTreeItem) => {
    if (!context) return;
    if (!treeItem?.canPreview) return;
    if (!treeItem.contentUri) return;

    context.dispatchContentsEvent({
      type: "open-preview-panel",
      payload: { path: treeItem.contentUri.toString() },
    });
  };
};
