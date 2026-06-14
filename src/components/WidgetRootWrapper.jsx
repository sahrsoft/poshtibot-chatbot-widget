'use client'

import dynamic from 'next/dynamic'

const WidgetRoot = dynamic(() => import('@/components/WidgetRoot'), { ssr: false })

export default function WidgetRootWrapper({ chatbotId }) {
  return <WidgetRoot chatbotId={chatbotId} />
}
