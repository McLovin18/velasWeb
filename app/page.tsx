import HomeClient from "./HomeClient";
import { getPublishedLandingServer } from "./lib/landing-server";

export const revalidate = 1800;

export default async function Home() {
  const initialLanding = await getPublishedLandingServer();

  return <HomeClient initialLanding={initialLanding} />;
}
