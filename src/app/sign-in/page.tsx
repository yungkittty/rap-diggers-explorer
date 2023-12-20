import LogoSVG from "@/app/_assets/logo-black.svg";
import { Heading } from "../_components/Heading";
import { Image } from "../_components/Image";
import { Text } from "../_components/Text";
import { Card } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { SpotifyButton } from "./_components/SpotifyButton";

const SignInPage = () => {
  return (
    <div className="relative flex flex-col flex-1 justify-center items-center">
      <div className="relative flex flex-col items-center justify-center">
        <Image
          className="absolute top-[-62px] ml-[-6px] rotate-2"
          src={LogoSVG}
          width={192}
          alt="" // @TODO - ...
          priority
          loading="eager"
        />
        <div className="z-10 mb-[-6px] px-2 py-1 rounded-sm bg-foreground">
          <Heading className="text-white">explorer</Heading>
        </div>
        <Card className="p-3">
          <SpotifyButton />
        </Card>
      </div>
      <div className="absolute bottom-[24px] flex flex-row text-xs text-primary/50">
        <a href="/legal-notices.txt">
          <Text className="uppercase">mentions légales</Text>
        </a>
        <span className="mx-3">|</span>
        <a href="/terms-and-conditions.txt">
          <Text className="uppercase">conditions générales d’utilisation</Text>
        </a>
        <span className="mx-3">|</span>
        <a href="privacy-policy.txt">
          <Text className="uppercase">politique de confidentialité</Text>
        </a>
      </div>
    </div>
  );
};

export default withAuth(SignInPage);
