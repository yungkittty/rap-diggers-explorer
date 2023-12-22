import { Heading } from "../_components/Heading";
import { Text } from "../_components/Text";
import { Card, CardHeader, CardTitle } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { FormFooter } from "./_components/FormFooter";

const ImportPage = () => {
  return (
    <div className="m-auto flex flex-col items-center justify-center">
      <Card className="w-full sm:w-3/4 md:w-3/5 lg:w-1/2 xl:w-2/5 2xl:w-1/3">
        <CardHeader className="space-y-4 pb-4">
          <CardTitle>
            <Heading>Choisis ta playlist</Heading>
          </CardTitle>
          {/* <CardDescription> - text-sm text-muted-foreground */}
          <Text className="text-base text-primary/70">
            <span className="mr-1.5 text-primary">👉</span>Choisis la playlist
            Spotify d’où seront importés les artistes qui formeront la base de
            tes recherches. Par la suite, tu pourras décider, ou non, de creuser
            certains de ces artistes pour t’en voir proposer des similaires.
            C’est par la répétition de ce procédé que tu découvriras la future
            pépite.
          </Text>
          <Text className="text-base text-primary/70">
            <span className="mr-1.5 text-primary">⚠️</span>Attention, une fois
            ta playlist choisie, tu ne pourras plus la changer. Cependant, tu
            pourras toujours réimporter les nouveaux artistes que tu auras
            ajoutés à celle-ci.
          </Text>
          {/* </CardDescription> */}
        </CardHeader>
        <FormFooter />
      </Card>
    </div>
  );
};

export default withAuth(ImportPage);
