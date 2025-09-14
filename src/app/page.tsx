import { api, HydrateClient } from "~/trpc/server";
import Main from "./(budget)/_components/Main";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <Main />
    </HydrateClient>
  );
}
