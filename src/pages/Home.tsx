import { BuilderLayout } from "@/components/builder/BuilderLayout";

export default function Home() {
  const demoUser = { id: 'demo', email: 'demo@lotus.local', name: 'Demo User' };
  return (
    <div className="h-screen w-screen bg-[#050505]">
      <BuilderLayout user={demoUser} />
    </div>
  );
}
