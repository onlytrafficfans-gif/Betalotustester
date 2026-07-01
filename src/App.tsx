import lotusLogo from '@/assets/lotus-logo.png';

function App() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#FBF4E9] text-[#2E2418]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#FBF4E9] px-8">
        <img
          src={lotusLogo}
          alt="LOTUS"
          className="w-full min-w-0 max-w-[300px] drop-shadow-[0_14px_30px_rgba(150,100,20,0.18)]"
        />
      </div>
    </main>
  );
}

export default App;
