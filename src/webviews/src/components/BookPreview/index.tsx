import { ReactNode, useMemo } from "react";

import { validateBook } from "zenn-model";

import styles from "./BookPreview.module.scss";

import { BookPreviewContent } from "../../../../schemas/book";
import { PreviewEvent } from "../../../../types";
import { BOOK_SLUG_PATTERN } from "../../../../utils/patterns";
import defaultCoverImage from "../../assets/images/book-cover.png";
import { useVSCodeApi } from "../../hooks/useVSCodeApi";
import { ValidationErrors } from "../ValidationErrors";
import { ZennLink } from "../ZennLink";

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
  const slug = BOOK_SLUG_PATTERN.test(book.slug || filename)
    ? book.slug || filename
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

  const includeChapters = chapters.filter((v) => !v.isExcluded);
  const excludeChapters = chapters.filter((v) => v.isExcluded);

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

            <div className={styles.titleHolder}>
              <h1 className={styles.title}>
                {book.title || "titleを指定してください"}
              </h1>
              <ZennLink type="book" slugs={{ bookSlug: book.slug }} />
            </div>
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
          {includeChapters.map((chapter) => (
            <li key={chapter.slug}>
              <div
                className={styles.chapterLink}
                onClick={() => previewChapterPage(chapter.fullPath)}
              >
                {chapter.title || "タイトルが設定されていません"}
                <span className={styles.chapterFilename}>
                  （{chapter.slug}）
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.excludeSection}>
          <h3 className={styles.sectionLabel}>除外</h3>

          <ol className={styles.chapterList}>
            {excludeChapters.map((chapter) => (
              <li key={chapter.slug}>
                <div
                  className={styles.chapterLink}
                  onClick={() => previewChapterPage(chapter.fullPath)}
                >
                  {chapter.title || "タイトルが設定されていません"}
                  <span className={styles.chapterFilename}>
                    （{chapter.slug}）
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};
