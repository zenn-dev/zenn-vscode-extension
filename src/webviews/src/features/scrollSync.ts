/**
 * This implementation is based on VS Code Markdown Language Features.
 *
 * Ref: https://github.com/microsoft/vscode/blob/9afcef5dd1ba4e8a21988090ec299003dccfddfd/extensions/markdown-language-features/preview-src/scroll-sync.ts
 */

const codeLineClass = "code-line";
const dataLineAttr = "data-line";

type CodeLineElement = {
  element: HTMLElement;
  line: number;
};

/**
 * Find the html elements that map to a specific target line in the editor.
 *
 * If an exact match, returns a single element. If the line is between elements,
 * returns the element prior to and the element after the given line.
 */
export function getElementsForSourceLine(targetLine: number): {
  previous: CodeLineElement;
  next?: CodeLineElement;
} {
  const lineNumber = Math.floor(targetLine);
  const elements = document.getElementsByClassName(codeLineClass);
  const elementsArray = Array.from(elements);
  const lines = elementsArray.map((element) => {
    const dataLine = element.getAttribute(dataLineAttr);
    if (!dataLine) {
      throw new Error("codeLineClass element must have data-line attribute");
    }
    const line = parseInt(dataLine, 10);
    return { element: element as HTMLElement, line };
  });
  let previous = lines[0] || null;
  for (const entry of lines) {
    if (entry.line === lineNumber) {
      return { previous: entry, next: undefined };
    } else if (entry.line > lineNumber) {
      return { previous, next: entry };
    }
    previous = entry;
  }
  return { previous };
}

function getElementBounds({ element }: CodeLineElement): {
  top: number;
  height: number;
} {
  const myBounds = element.getBoundingClientRect();

  // Some code line elements may contain other code line elements.
  // In those cases, only take the height up to that child.
  const codeLineChild = element.querySelector(`.${codeLineClass}`);
  if (codeLineChild) {
    const childBounds = codeLineChild.getBoundingClientRect();
    const height = Math.max(1, childBounds.top - myBounds.top);
    return {
      top: myBounds.top,
      height: height,
    };
  }

  return myBounds;
}

/**
 * Attempt to reveal the element for a source line in the editor.
 */
export function scrollToRevealSourceLine(editorLine: number) {
  if (editorLine <= 0) {
    window.scroll(window.scrollX, 0);
    return;
  }

  const { previous, next } = getElementsForSourceLine(editorLine);
  if (!previous) {
    return;
  }
  let scrollTo = 0;
  const rect = getElementBounds(previous);
  const previousTop = rect.top;
  if (next && next.line !== previous.line) {
    // Between two elements. Go to percentage offset between them.
    const betweenProgress =
      (editorLine - previous.line) / (next.line - previous.line);
    const previousEnd = previousTop + rect.height;
    const betweenHeight =
      next.element.getBoundingClientRect().top - previousEnd;
    scrollTo = previousEnd + betweenProgress * betweenHeight;
  } else {
    const progressInElement = editorLine - Math.floor(editorLine);
    scrollTo = previousTop + rect.height * progressInElement;
  }
  scrollTo = Math.abs(scrollTo) < 1 ? Math.sign(scrollTo) : scrollTo;
  window.scroll(window.scrollX, Math.max(1, window.scrollY + scrollTo));
}
