'use client';

import { useRouter } from "next/navigation";
import Image from 'next/image';
import landing_background from '../public/landing_background.png';
import logo from '../public/logo.png';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth');
  }

  const handleTryNow = () => {
    router.push('/explore');
  }

  return (
    <main className="relative h-screen w-full overflow-hidden flex flex-col">
      {/* Background Image */}
      <Image
        src={landing_background}
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
        quality={100}
      />

      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-24 py-6 bg-transparent z-10">
        <Image src={logo} alt="Logo" width={120} height={120} className="object-cover" priority quality={100} />
        <div className="flex gap-4">
          <button onClick={handleSignIn} className="text-white px-5 py-2 font-semibold rounded-lg">Sign in</button>
          <button onClick={handleTryNow} className="bg-white font-black px-5 py-2 rounded-lg transition-all duration-200 hover:bg-opacity-80 hover:transform hover:scale-105">Try now</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <h1 className="text-4xl text-center text-white font-poppins">
          <b>AI Agents made</b> <i className="font-thin">easy</i>
        </h1>
        <h1 className="text-2xl text-center text-white font-geistMono mt-3">Agentec allows you to deploy, monitor, & optimize AI agents effortlessly.</h1>
      </div>
    </main>
  );
}