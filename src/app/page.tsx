import Chat from "@/components/Chat";
import { getProfile } from "@/lib/content";

export default function Home() {
  const { name, title, email, starter_questions } = getProfile();
  return (
    <Chat
      name={name}
      title={title}
      email={email}
      starterQuestions={starter_questions ?? []}
    />
  );
}
