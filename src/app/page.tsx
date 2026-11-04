import Chat from "@/components/Chat";
import { getProfile } from "@/lib/content";

export default function Home() {
  const { name, title, email, links } = getProfile();
  return <Chat name={name} title={title} email={email} links={links} />;
}
