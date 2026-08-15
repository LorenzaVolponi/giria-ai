import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GiriaDetalheRedirect({ params }: Props) {
  const { slug } = await params;
  redirect(`/o-que-significa/${encodeURIComponent(decodeURIComponent(slug))}`);
}
