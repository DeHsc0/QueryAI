import type { Metadata } from 'next'
import { ChatWorkspace } from '@/components/chat/chat-workspace'

export const metadata: Metadata = {
  title: 'Chat — QueryAI',
}

export default async function DatabaseChatPage({
  params,
}: {
  params: Promise<{ databaseId: string }>
}) {
  const { databaseId } = await params
  return <ChatWorkspace databaseId={databaseId} />
}