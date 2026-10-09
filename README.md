## Poshtibot Chatbot Widget

Production deployment requires `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`,
`NEXT_PUBLIC_SERVER_URL`, and the server-only `API_SERVER_URL`. Copy `.env.example`
for local development. `API_SERVER_URL` must be supplied at container runtime.

The embed supports `data-widget-url` and `data-server-url` attributes for staging:

```html
<script src="https://widget.poshtibot.com/widget.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  data-widget-url="https://widget.poshtibot.com"
  data-server-url="https://server.poshtibot.com"></script>
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
