/**
 * 注意:
 * acquireVsCodeApi() は一つの WebView で一回しか実行できないので、複数回実行しないようにする。
 */

const api = acquireVsCodeApi();

export const useVSCodeApi = () => {
  return api;
};
