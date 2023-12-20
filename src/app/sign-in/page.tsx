import LogoSVG from "@/app/_assets/logo-black.svg";
import { Heading } from "../_components/Heading";
import { Image } from "../_components/Image";
import { Text } from "../_components/Text";
import { Card } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { SpotifyButton } from "./_components/SpotifyButton";

const SignInPage = () => {
  return (
    <div className="relative flex flex-col flex-1 justify-center items-center px-12">
      <div className="relative flex flex-col items-center justify-center">
        <Image
          className="absolute top-[-63px] ml-[-6px] rotate-2"
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
        <Text className="text-center mt-3 text-[10px] text-primary/50">
          En continuant, tu acceptes les
          <a
            className="mx-0.5 underline"
            href="/conditions-generales-utilisation.txt"
          >
            conditions générales d’utilisation
          </a>
          ainsi que la
          <a
            className="ml-0.5 underline"
            href="/politique-de-confidentialite.txt"
          >
            politique de confidentialité
          </a>
          .
        </Text>
      </div>
      <div className="absolute bottom-[12px] flex flex-row items-center text-[10px] text-primary/30">
        <a href="/mentions-legales.txt">
          <Text className="uppercase">mentions légales</Text>
        </a>
        <span className="mx-1.5 leading-none">|</span>
        <a href="/conditions-generales-utilisation.txt">
          <Text className="uppercase">conditions générales d’utilisation</Text>
        </a>
        <span className="mx-1.5 leading-none">|</span>
        <a href="/politique-de-confidentialite.txt">
          <Text className="uppercase">politique de confidentialité</Text>
        </a>
      </div>
    </div>
  );
};

export default withAuth(SignInPage);
