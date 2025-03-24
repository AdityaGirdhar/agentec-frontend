'use client';

import { useRouter } from "next/navigation";
import Image from 'next/image';
import landing_background from '../public/landing_background.png';
import logo from '../public/logo.png';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/login');
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
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-24 py-4 md:py-6 bg-transparent z-10">
        <Image 
          src={logo} 
          alt="Logo" 
          width={80} 
          height={80} 
          className="object-cover" 
          priority 
          quality={100} 
        />
        <div className="flex gap-4">
          <button 
            onClick={handleSignIn} 
            className="bg-white text-sm md:text-base font-black px-4 md:px-5 py-2 rounded-md md:rounded-lg transition-all duration-200 hover:bg-opacity-80 hover:scale-105"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow p-4 text-center">
        <h1 className="text-3xl md:text-4xl text-white font-poppins font-bold leading-tight">
          AI Agents made <span className="font-thin italic">easy</span>
        </h1>
        <h2 className="text-lg md:text-2xl text-white font-geistMono mt-3 max-w-2xl">
          Agentec allows you to deploy, monitor, & optimize AI agents effortlessly.
        </h2>
      </div>
    </main>
  );
}