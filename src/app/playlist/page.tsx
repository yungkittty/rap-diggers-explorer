import { Heading } from "../_components/Heading";
import { Text } from "../_components/Text";
import { Card, CardHeader, CardTitle } from "../_components/ui/card";
import { withAuth } from "../_hocs/auth";
import { FormFooter } from "./_components/FormFooter";

const PlaylistPage = () => {
  return (
    <div className="m-auto flex flex-col items-center justify-center">
      <Card className="w-full sm:w-[550px] sm:min-w-[550px]">
        <CardHeader className="space-y-4 pb-4">
          <CardTitle>
            <Heading>Créer ta playlist</Heading>
          </CardTitle>
          <Text className="text-base text-primary/70">
            Crée une playlist avec des morceaux d’artistes que tu aimes. À
            partir de cette playlist, nous serons en mesure de te proposer des
            artistes similaires que tu pourras décider de creuser, ou non, et
            cela ainsi de suite jusqu’à découvrir la future pépite.
            <span className="ml-1 text-primary">✨</span>
          </Text>
          {/* </CardDescription> */}
        </CardHeader>
        <FormFooter />
      </Card>
    </div>
  );
};

export default withAuth(PlaylistPage);
