import LogoSVG from "@/app/_assets/logo-black.svg";
import { Heading } from "../_components/Heading";
import { Image } from "../_components/Image";
import { Card } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { SpotifyButton } from "./_components/SpotifyButton";

const SignInPage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center m-auto">
      <Image
        className="absolute top-[-62px] ml-[-6px] rotate-2"
        src={LogoSVG}
        width={192}
        alt=""
      />
      <div className="z-10 mb-[-6px] px-2 py-1 rounded-sm bg-foreground">
        <Heading className="text-white">explorer</Heading>
      </div>
      <Card className="p-3">
        <SpotifyButton />
      </Card>
    </div>
  );
};

export default withAuth(SignInPage);
