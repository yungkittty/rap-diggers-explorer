import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";

type TopBarAvatar = {};
export const TopBarAvatar = (props: TopBarAvatar) => {
  return (
    <Avatar className="h-full w-[unset] aspect-square">
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>QW</AvatarFallback>
    </Avatar>
  );
};
