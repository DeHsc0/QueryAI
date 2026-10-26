import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getSampleEntry } from "@/lib/sample-catalog-server"
import { SampleDetail } from "@/components/dashboard/samples/sample-detail"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sampleId: string }>
}): Promise<Metadata> {
  const { sampleId } = await params
  const entry = await getSampleEntry(sampleId)
  return { title: entry ? `${entry.name} — QueryAI` : "Sample not found — QueryAI" }
}

export default async function SamplePage({
  params,
}: {
  params: Promise<{ sampleId: string }>
}) {
  const { sampleId } = await params
  const entry = await getSampleEntry(sampleId)
  if (!entry) notFound()

  return (
    <div className="pb-10">
      <Link
        href="/dashboard"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 font-mono text-[11.5px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to databases
      </Link>
      <SampleDetail entry={entry} />
    </div>
  )
}
