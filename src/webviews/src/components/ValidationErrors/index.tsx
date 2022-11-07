import React, { useMemo } from "react";

import { ValidationError } from "zenn-validator";

import styles from "./ValidationErrors.module.scss";

import CallMadeSVG from "../../assets/svg/call-made.svg";
import ErrorSVG from "../../assets/svg/error.svg";

const ValidationErrorRow: React.VFC<ValidationError> = ({
  message,
  isCritical,
  detailUrl,
  detailUrlText,
}) => {
  return (
    <div
      className={`${styles.validationErrorRow} ${
        isCritical ? styles.critical : ""
      }`}
    >
      <ErrorSVG className={styles.errorIcon} />
      <div className={styles.errorMessage}>
        {message}
        {typeof detailUrl === "string" && (
          <a
            className={styles.detailLink}
            href={detailUrl}
            target="_blank"
            rel="nofollow noreferrer"
          >
            {detailUrlText || "詳細を見る"}
            <CallMadeSVG className={styles.callMadeIcon} />
          </a>
        )}
      </div>
    </div>
  );
};

export const ValidationErrors: React.VFC<{
  validationErrors: ValidationError[];
}> = ({ validationErrors }) => {
  const { criticalErrors, warnings } = useMemo(
    () =>
      validationErrors.reduce(
        (acc, val) => {
          acc[val.isCritical ? "criticalErrors" : "warnings"].push(val);
          return acc;
        },
        {
          criticalErrors: [],
          warnings: [],
        } as {
          criticalErrors: ValidationError[];
          warnings: ValidationError[];
        }
      ),
    [validationErrors]
  );

  if (!validationErrors.length) return null;

  return (
    <div className={styles.validationError}>
      {criticalErrors.length > 0 && (
        <div className={styles.critical}>
          <div className={`${styles.title} ${styles.criticalTitle}`}>
            {criticalErrors.length}件のエラーがあります
          </div>
          {criticalErrors.map((validationError, i) => (
            <ValidationErrorRow
              key={`validation-error-${i}`}
              {...validationError}
            />
          ))}
        </div>
      )}
      {warnings.length > 0 && (
        <div className={styles.warnings}>
          <div className={styles.warningTitle}>
            {warnings.length}件の注意事項があります
          </div>
          {warnings.map((validationError, i) => (
            <ValidationErrorRow
              key={`validation-error-${i}`}
              {...validationError}
            />
          ))}
        </div>
      )}
    </div>
  );
};
