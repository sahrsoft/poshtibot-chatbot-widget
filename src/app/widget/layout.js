export const metadata = {
  title: "Poshtibot Widget",
}

export default function WidgetLayout({ children }) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "transparent",
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  )
}