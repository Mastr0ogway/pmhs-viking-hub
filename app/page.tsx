import { HubShell } from "@/components/hub/HubShell";
import { getAllHubData } from "@/lib/sheets";

export const revalidate = 60;

export default async function HomePage() {
  const data = await getAllHubData();
  return <HubShell data={data} />;
}
