import { Heading } from "../_components/Heading";
import { Text } from "../_components/Text";
import { Card, CardHeader, CardTitle } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { FormFooter } from "./_components/FormFooter";

const ImportPage = () => {
  return (
    <div className="m-auto flex flex-col items-center justify-center">
      <Card className="w-full sm:w-3/4 md:w-3/5 lg:w-1/2 xl:w-2/5 2xl:w-1/3">
        <CardHeader className="space-y-4 pb-5">
          <CardTitle>
            <Heading>Choisis ta playlist</Heading>
          </CardTitle>
          {/* <CardDescription> - text-sm text-muted-foreground */}
          {/* Choisis la playlist Spotify d’où seront importés les artistes qui
            formeront la base de tes recherches. Par la suite, tu pourras
            décider, ou non, de creuser certains de ces artistes pour t’en voir
            proposer des similaires. C’est par la répétition de ce procédé que
            tu découvriras la future pépite. */}
          {/* Choisis la playlist Spotify d’où seront importés tes premiers
            artistes. Ensuite, tu pourras décider, ou non, de creuser certains
            de ces artistes pour t’en voir proposer des similaires et cela ainsi
            de suite jusqu’à la découverte de ta futur pépite. */}
          <Text className="text-base text-primary/70">
            Choisis la playlist Spotify d’où seront importés les artistes qui
            formeront la base de tes recherches. Ensuite, tu pourras décider, ou
            non, de creuser certains de ces artistes pour t’en voir proposer
            d’autres similaires, et cela ainsi de suite jusqu’à la découverte de
            ta future pépite.
          </Text>
          <Text className="text-base text-primary/70">
            <span className="mr-1.5 text-primary">⚠️</span>Il est possible que
            tu arrives à court d’artistes. Tu pourras à tout moment en
            réimporter de nouveaux, mais cela uniquement depuis cette playlist.
            Du coup, le choix de ta playlist est{" "}
            <span className="underline">important</span> !
          </Text>
          {/* <span className="mr-1.5 text-primary">⚠️</span>Il est possible que
            tu arrives à court d’artistes, tu pourras à tout moment réimporter
            de nouveaux. Cependant, tu pourras en réimporter seulement depuis
            cette playlist. Ainsi, le choix de la playlist est{" "}
            <span className="underline">définitif</span> ! */}
          {/* <span className="mr-1.5 text-primary">⚠️</span>Si tu arrives à court
            d’artistes, tu pourras à tout moment réimporter de nouveaux.
            Cependant, tu pourras en réimporter seulement depuis cette playlist.
            Ainsi, le choix de la playlist est{" "}
            <span className="underline">définitif</span> ! */}
          {/* Pourquoi, attention ? */}
          {/* <Text className="text-base text-primary/70">
            <span className="mr-1.5 text-primary">⚠️</span>Attention, une fois
            ta playlist choisie, tu ne pourras plus la changer. Cependant, tu
            pourras toujours réimporter les nouveaux artistes que tu auras
            ajoutés à celle-ci.
          </Text> */}
          {/* <Text className="text-base text-primary/70">
            <span className="mr-1.5 text-primary">👉</span>Tu pourras à tous
            moment réimporter les nouveaux artistes que tu y auras ajoutés.
            Cependant, tu ne pourras plus de playlist une fois choisie !
          </Text> */}
          {/* </CardDescription> */}
        </CardHeader>
        <FormFooter />
      </Card>
    </div>
  );
};

export default withAuth(ImportPage);
