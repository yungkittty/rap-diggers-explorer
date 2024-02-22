import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import { Button } from "@/app/_components/ui/button";

export const TopBarExportButton = () => {
  return (
    <a href="/api/artist-status/export">
      <Button className="flex flex-row items-center">
        <Text className="font-bold uppercase leading-none">exporter</Text>
        <Icon className="ml-2.5 text-base" name="download" />
      </Button>
    </a>
  );
};
