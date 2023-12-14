import { Heading } from "../_components/Heading";
import { Icon } from "../_components/Icon";
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
            <Heading>Importe tes artistes</Heading>
          </CardTitle>
          {/* <CardDescription> - text-sm text-muted-foreground */}
          <Text className="text-base text-primary/70">
            Importe tes artistes depuis une playlist{" "}
            <span className="text-spotify">
              Spotify <Icon className="text-base mx-[-2px]" name="spotify" />
            </span>{" "}
            pour former la base de tes recherches. Par la suite, tu pourras
            décider, ou non, de creuser certains de ces artistes pour t’en voir
            proposer des similaires. C’est par la répétition de ce procédé que
            tu découvriras la future pépite.
            <span className="text-primary">✨</span>
          </Text>
          {/* </CardDescription> */}
        </CardHeader>
        <FormFooter />
      </Card>
    </div>
  );
};

export default withAuth(ImportPage);
