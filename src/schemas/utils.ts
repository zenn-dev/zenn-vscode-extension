import * as vscode from "vscode";

import { ContentError } from "./error";

import { CacheKey } from "../contentsCache";
import { AppContext } from "../context/app";
import { Contents, ContentsLoadResult } from "../types";

type GetKeyFunc = (context: AppContext, uri: vscode.Uri) => CacheKey;
type LoadFunc = (uri: vscode.Uri) => Promise<ContentsLoadResult<Contents>>;
type CachedLoadFunc<T extends LoadFunc> = (
  context: AppContext,
  uri: vscode.Uri,
  force?: boolean
) => ReturnType<T>;

export const withCache = <T extends LoadFunc>(
  getKey: GetKeyFunc,
  callback: T
): CachedLoadFunc<T> => {
  return (async (context, uri, force) => {
    const key = getKey(context, uri);

    if (!force) {
      const value = context.cache.getCache(key);
      if (value) return value;
    }

    const result = await callback(uri);

    if (!ContentError.isError(result)) {
      context.cache.setCache(key, result);
    }

    return result;
  }) as CachedLoadFunc<T>;
};
