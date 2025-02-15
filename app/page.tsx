'use client';

import Image from 'next/image';
import landing_background from '../public/landing_background.png';
import logo from '../public/logo.png';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 ">
      <Image
        src={landing_background}
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
        quality={100}
      />
      <Image
        src={logo}
        alt="Logo"
        width={150}
        height={150}
        className="object-cover absolute top-[40px]"
        priority
        quality={100}
      />
      <div>
        <h1 className="text-4xl text-center text-white font-poppins">
            <b>AI Agents made</b> <i className="font-thin">easy</i>
        </h1>
        <h1 className="text-2xl text-center text-white font-geistMono mt-3 italic">
            coming soon 
        </h1>
      </div>
    </main>
  );
}
