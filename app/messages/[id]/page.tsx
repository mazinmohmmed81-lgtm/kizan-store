import ChatClient from "./ChatClient";

export function generateStaticParams() {
  return [{ id: "dummy" }];
}

export default function ChatPage() {
  return <ChatClient />;
}