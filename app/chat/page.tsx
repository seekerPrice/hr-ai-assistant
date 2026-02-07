import ChatbotModule from "../components/chatbot/ChatbotModule";

export default function ChatPage() {
  return (
    <main className="p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Chatbot</h1>
          <p className="mt-1 text-slate-500">Modern HR assistant for instant guidance and drafts.</p>
        </div>
      </div>

      <ChatbotModule />
    </main>
  );
}
