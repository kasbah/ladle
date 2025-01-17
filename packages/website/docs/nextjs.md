---
id: nextjs
title: Next.js
---

# Next.js

Next.js is a popular React framework that provides a lot of features out of the box. Ladle works well with Next.js, but there are some caveats.

## `next/image` and `next/link`

This component relies on a build-time transformation that Next.js provides. However, Ladle has its own build process. To make `next/image` work, we need to replace it with a simple `<img />` element.

You'll need to customize Vite's config. Place it in the root directory of your project.

```tsx title="vite.config.ts"
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "next/image": path.resolve(__dirname, "./.ladle/UnoptimizedImage.tsx"),
      "next/link": path.resolve(__dirname, "./.ladle/UnoptimizedLink.tsx"),
    },
  },
});
```

```tsx title=".ladle/UnoptimizedLink.tsx"
const UnoptimizedLink = (props: any) => {
  return <a {...props} />;
};
export default UnoptimizedLink;
```

```tsx title=".ladle/UnoptimizedImage.tsx"
const UnoptimizedImage = (props: any) => {
  return <img {...props} />;
};
export default UnoptimizedImage;
```

This solution is inspired by [blog post](https://sdorra.dev/posts/2023-01-18-ladle-next-image#nextimage).

## Using environment variables

To make use of your current `.env` files, you simply need to let Vite know and ensure they are passed to the browser. As Next.js requires you to add `NEXT_PUBLIC_` as a prefix to your frontend environment variables, we also need to inform Vite about this.

To achieve this, you will need to customize Vite's configuration further.

```ts title="vite.config.ts"
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
  // resolve: {...},
  define: {
    "process.env": loadEnv(mode, process.cwd(), "NEXT_PUBLIC_"),
  },
}));
```
