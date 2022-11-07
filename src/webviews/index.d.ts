declare module "*.module.scss" {
  const styles: { [key: string]: string };
  export default styles;
}

declare module "*.png" {
  const path: string;
  export default path;
}

declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}
