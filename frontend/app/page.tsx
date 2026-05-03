import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <header className="border-b border-rule px-6 py-5">
        <div className="mx-auto max-w-prose">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">
            AI representative
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Jiya Singhal
          </h1>
          <p className="mt-1 text-sm text-muted">
            Software engineering intern at SingOneSong · CS undergrad at Scaler
            School of Technology
          </p>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </main>
  );
}
