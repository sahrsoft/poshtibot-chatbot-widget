export const metadata = {
  title: 'Poshtibot Widget'
}

export default function WidgetLayout({ children }) {
  return (
    <>
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          overflow: hidden !important;
        }
      `}</style>
      {children}
    </>
  )
}
