import { ReactNode, useMemo } from "react";

import { validateArticle } from "zenn-model";

import styles from "./ArticlePreview.module.scss";

import { ArticlePreviewContent } from "../../../../schemas/article";
import { formatPublishedAt } from "../../../../utils/helpers";
import { ValidationErrors } from "../ValidationErrors";

interface ArticlePropertyProps {
  title: string;
  children: ReactNode;
}

export const ArticleProperty = ({ title, children }: ArticlePropertyProps) => {
  return (
    <div className={styles.headerProperty}>
      <div className={styles.headerPropertyLabel}>{title}</div>
      <div className={styles.headerPropertyValue}>{children}</div>
    </div>
  );
};

interface ArticlePreviewProps {
  content: ArticlePreviewContent;
}

export const ArticlePreview = ({ content }: ArticlePreviewProps) => {
  const { html, article } = content;

  const validationErrors = useMemo(() => validateArticle(article), [article]);

  const [publishedAt, scheduledPublish] = useMemo(() => {
    const date = formatPublishedAt(article.published_at);
    return [date, date && Date.parse(date) > Date.now()];
  }, [article.published_at]);

  return (
    <div>
      <div className={styles.headerContainer}>
        <header className={styles.header}>
          <div className={styles.emoji}>{article.emoji}</div>

          <h1 className={styles.title}>
            {article.title || "titleを指定してください"}
          </h1>

          <div className={styles.headerPropertyContainer}>
            <ArticleProperty title="slug">
              {article.slug || "見つかりませんでした"}
            </ArticleProperty>

            <ArticleProperty title="published">
              {typeof article.published === "boolean"
                ? article.published
                  ? scheduledPublish
                    ? "true（公開予約）"
                    : "true（公開）"
                  : "false（下書き）"
                : "true もしくは false を指定してください"}
            </ArticleProperty>

            {publishedAt && (
              <ArticleProperty title="published_at">
                {publishedAt}
              </ArticleProperty>
            )}

            {!!article.publication_name && (
              <ArticleProperty title="publication_name">
                {article.publication_name}
              </ArticleProperty>
            )}

            <ArticleProperty title="type">
              {article.type === "tech"
                ? "tech（技術記事）"
                : article.type === "idea"
                ? "idea（アイデア）"
                : "tech もしくは idea を指定してください"}
            </ArticleProperty>

            <ArticleProperty title="topics">
              {Array.isArray(article.topics) && article.topics.length
                ? article.topics.map((topic) => (
                    <span key={topic} className={styles.topic}>
                      {topic}
                    </span>
                  ))
                : "配列による指定が必要です"}
            </ArticleProperty>
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
