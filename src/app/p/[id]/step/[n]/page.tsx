import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/store";
import { Wizard } from "@/components/wizard/Wizard";

export const dynamic = "force-dynamic";

export default async function StepPage({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  const step = Number(n);
  if (!Number.isInteger(step) || step < 1 || step > 4) redirect(`/p/${id}/step/1`);
  const project = await getProject(id);
  if (!project) notFound();
  return <Wizard initial={project} step={step} />;
}
