import LogoSVG from "@/app/_assets/logo-black.svg";
import { Image } from "../_components/Image";
import { Heading } from "../_components/Heading";
import { SpotifyButton } from "./_components/SpotifyButton";

const SignIn = () => {
  return (
    <div className="relative m-auto flex flex-col items-center justify-center ">
      <Image
        className="absolute top-[-62px] ml-[-6px] rotate-2"
        src={LogoSVG}
        width={190}
        alt=""
      />
      <div className="z-10 mb-[-8px] rounded-sm bg-foreground py-1 pl-2 pr-2.5">
        <Heading className="text-xl italic text-white">explorer</Heading>
      </div>
      <div className="flex items-center justify-center rounded-full bg-foreground/20 p-4">
        <SpotifyButton className="shadow" />
      </div>
    </div>
  );
};

export default SignIn;
