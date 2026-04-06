import { getFeaturedProperties } from "@/lib/data/get-data";
import HomeClient from "./HomeClient";

export default async function Home() {
  const featured = await getFeaturedProperties();
  return <HomeClient featuredProperties={featured} />;
}
