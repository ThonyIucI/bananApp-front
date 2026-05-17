import { GaiaChat } from '@/modules/gaia/components/GaiaChat';

export default function GaiaPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col md:h-[calc(100vh-3rem)]">
      <GaiaChat plan="free" />
    </div>
  );
}
