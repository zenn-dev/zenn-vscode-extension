import { ReactNode, useMemo } from "react";

import { validateBook } from "zenn-validator";

import styles from "./BookPreview.module.scss";

import { BookPreviewContent } from "../../../../schemas/book";
import { PreviewEvent } from "../../../../types";
import { BOOK_SLUG_PATTERN } from "../../../../utils/patterns";
import defaultCoverImage from "../../assets/images/book-cover.png";
import { useVSCodeApi } from "../../hooks/useVSCodeApi";
import { ValidationErrors } from "../ValidationErrors";

interface BookPreviewProperty {
  title: string;
  children: ReactNode;
}

const BookConfigProperty = ({ title, children }: BookPreviewProperty) => {
  return (
    <div className={styles.headerProperty}>
      <div className={styles.headerPropertyLabel}>{title}</div>
      <div className={styles.headerPropertyValue}>{children}</div>
    </div>
  );
};

interface BookPreviewProps {
  content: BookPreviewContent;
}

export const BookPreview = ({ content }: BookPreviewProps) => {
  const { book, chapters, filename, coverImagePath } = content;
  const slug = BOOK_SLUG_PATTERN.test(filename)
    ? filename
    : "不正なスラッグです";

  const vscode = useVSCodeApi();
  const validationErrors = useMemo(() => validateBook(book), [book]);

  const previewChapterPage = (chapterPath: string) => {
    const event: PreviewEvent = {
      type: "open-preview-panel",
      payload: { path: chapterPath },
    };

    vscode.postMessage(event);
  };

  return (
    <div>
      <div className={styles.headerContainer}>
        <header className={styles.header}>
          <div className={styles.titleContainer}>
            <div>
              <img
                className={styles.coverImage}
                src={coverImagePath || defaultCoverImage}
                alt=""
              />
            </div>

            <h1 className={styles.title}>
              {book.title || "titleを指定してください"}
            </h1>
          </div>

          <div className={styles.headerPropertyContainer}>
            <BookConfigProperty title="slug">{slug}</BookConfigProperty>

            <BookConfigProperty title="published">
              {typeof book.published === "boolean"
                ? book.published
                  ? "true（公開）"
                  : "false（下書き）"
                : "true もしくは false を指定してください"}
            </BookConfigProperty>

            <BookConfigProperty title="price">
              {typeof book.price === "number"
                ? book.price
                : "半角数字で指定してください"}
            </BookConfigProperty>

            <BookConfigProperty title="topics">
              {Array.isArray(book.topics) && book.topics.length
                ? book.topics.map((topic) => (
                    <div key={topic} className={styles.topic}>
                      {topic}
                    </div>
                  ))
                : "指定が必要です"}
            </BookConfigProperty>

            <BookConfigProperty title="summary">
              {book.summary || "指定が必要です"}
            </BookConfigProperty>
          </div>

          {!!validationErrors.length && (
            <div className={styles.validationErrors}>
              <ValidationErrors validationErrors={validationErrors} />
            </div>
          )}
        </header>
      </div>

      <section className={styles.chaptersSection}>
        <h2 className={styles.sectionTitle}>Chapters</h2>

        <ol className={styles.chapterList}>
          {chapters.map((chapter) => (
            <li key={chapter.slug}>
              <div
                className={styles.chapterLink}
                onClick={() => previewChapterPage(chapter.path)}
              >
                {chapter.title || "タイトルが設定されていません"}
                <span className={styles.chapterFilename}>
                  （{chapter.slug}）
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};
