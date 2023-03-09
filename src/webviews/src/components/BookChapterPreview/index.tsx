import { ReactNode, useMemo } from "react";

import { validateBookChapter } from "zenn-model";

import styles from "./BookChapterPreview.module.scss";

import { BookChapterPreviewContent } from "../../../../schemas/bookChapter";
import { PreviewEvent } from "../../../../types";
import LeftArrowSVG from "../../assets/svg/left-arrow.svg";
import { useVSCodeApi } from "../../hooks/useVSCodeApi";
import { ValidationErrors } from "../ValidationErrors";
import { ZennLink } from "../ZennLink";

interface BookChapterPropertyProps {
  title: string;
  children: ReactNode;
}

export const BookChapterProperty = ({
  title,
  children,
}: BookChapterPropertyProps) => {
  return (
    <div className={styles.headerProperty}>
      <div className={styles.headerPropertyLabel}>{title}</div>
      <div className={styles.headerPropertyValue}>{children}</div>
    </div>
  );
};

interface BookChapterPreviewProps {
  content: BookChapterPreviewContent;
}

export const BookChapterPreview = ({ content }: BookChapterPreviewProps) => {
  const { html, filename, book, chapter, bookFullPath, bookFilename } = content;

  const vscode = useVSCodeApi();
  const validationErrors = useMemo(
    () => validateBookChapter(chapter),
    [chapter]
  );

  const goToBookPreviewPage = () => {
    const event: PreviewEvent = {
      type: "open-preview-panel",
      payload: { path: bookFullPath },
    };

    vscode.postMessage(event);
  };

  return (
    <div>
      <nav className={styles.bookNavi}>
        <div className={styles.bookLink} onClick={goToBookPreviewPage}>
          <LeftArrowSVG width={21} height={21} />
          <span className="chapter-header__book-title">
            {book.title || bookFilename}
          </span>
        </div>
      </nav>

      <div className={styles.headerContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>{chapter.title}</h1>

          <ZennLink
            type="bookChapter"
            slugs={{
              chapter: {
                bookSlug: book.slug,
                chapterSlug: chapter.slug,
              },
            }}
          />

          <div className={styles.headerPropertyContainer}>
            <BookChapterProperty title="slug">
              {filename.replace(/\.md$/, "")}
            </BookChapterProperty>

            <BookChapterProperty title="free">
              {book.price === 0
                ? "本の価格が¥0であるためチャプターは無料公開されます"
                : chapter.free
                ? "true（無料公開）"
                : "false（購入者のみ閲覧可）"}
            </BookChapterProperty>
          </div>

          {!!validationErrors.length && (
            <div className={styles.validationErrors}>
              <ValidationErrors validationErrors={validationErrors} />
            </div>
          )}
        </header>
      </div>

      <div className={styles.zncContainer}>
        <div className="znc" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};
