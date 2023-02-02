import * as vscode from "vscode";

import { ContentBase } from "../types";
import { GUIDE_DOCS_BASE_URL } from "../variables";

/**
 * ガイドのメタ情報
 */
export interface Guide {
  title: string;
  slug: string;
  hash?: string;
  emoji: string;
  isBeta?: boolean;
}

/**
 * ガイドの情報を含んだ型
 */
export interface GuideContent extends ContentBase {
  type: "guide";
  html?: string;
  value: Guide;
}

export type GuideDocsMeta = {
  title: string;
  slug: string;
  hash?: string;
  emoji: string;
  isBeta?: boolean;
};

export const createGuideContent = (
  guideDocsMeta: GuideDocsMeta
): GuideContent => {
  return {
    type: "guide",
    value: guideDocsMeta,
    filename: guideDocsMeta.slug,
    uri: vscode.Uri.parse(`${GUIDE_DOCS_BASE_URL}${guideDocsMeta.slug}`),
  };
};
