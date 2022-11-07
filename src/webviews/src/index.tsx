import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { ArticlePreview } from "./components/ArticlePreview";
import { BookChapterPreview } from "./components/BookChapterPreview";
import { BookPreview } from "./components/BookPreview";
import { useVSCodeApi } from "./hooks/useVSCodeApi";

import { ZennPreviewContents, ZennPreviewEvent } from "../../panels/types";
import "zenn-content-css";
import "./styles/index.scss";

const App = () => {
  const vscode = useVSCodeApi();
  const defaultValue = (vscode.getState() as any)?.content || null;
  const [content, setContent] = useState<ZennPreviewContents | null>(
    defaultValue
  );

  // init embed elements
  useEffect(() => {
    import("zenn-embed-elements");
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = event.data as ZennPreviewEvent;

      console.log("メッセージを受信", { msg });

      switch (msg.type) {
        case "READY_PREVIEW": {
          if (msg.result) {
            setContent(msg.result);
            vscode.setState({ content: msg.result });
          }
          break;
        }

        case "UPDATE_PREVIEW": {
          const result = msg.result;

          if (result && result.type === content?.type) {
            setContent(result);
            vscode.setState({ content: msg.result });
          }
        }
      }
    };

    window.addEventListener("message", onMessage);

    if (content === null) {
      const event: ZennPreviewEvent = { type: "READY_PREVIEW" };
      vscode.postMessage(event);
    }

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [content]);

  return (
    <div>
      {content?.type === "article" && <ArticlePreview content={content} />}
      {content?.type === "book" && <BookPreview content={content} />}
      {content?.type === "bookChapter" && (
        <BookChapterPreview content={content} />
      )}
    </div>
  );
};

// VSCodeのWebViewのデフォルトスタイルを削除する
if (typeof window !== "undefined") {
  const defaultStyle = document.getElementById("_defaultStyles");
  defaultStyle?.remove();
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(<App />);
