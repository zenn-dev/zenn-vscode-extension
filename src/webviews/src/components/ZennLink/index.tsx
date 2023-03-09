import styles from "./ZennLink.module.scss";

import { PreviewContentsType } from "../../../../types";
import { createZennLinkUri, SlugsForLinkUri } from "../../../../utils/helpers";
import CallMadeSVG from "../../assets/svg/call-made.svg";

interface ZennLinkProps {
  type: PreviewContentsType;
  slugs: SlugsForLinkUri;
}

export const ZennLink = ({ type, slugs }: ZennLinkProps) => {
  const zennLinkUri = createZennLinkUri(type, slugs);

  return (
    <div className={styles.zennLink}>
      <a
        className={styles.zennLinkAnker}
        target="_blank"
        rel="noopener noreferrer"
        href={zennLinkUri}
      >
        zenn.devで開く
        <CallMadeSVG className={styles.callMadeIcon} />
      </a>
    </div>
  );
};
