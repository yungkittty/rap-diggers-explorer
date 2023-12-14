"use client";

import { Heading } from "@/app/_components/Heading";
import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { useToast } from "@/app/_components/ui/use-toast";
import { DELETE_UsersOuput } from "@/app/_types/api";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import useSWRMutation from "swr/mutation";

const deleteUser = async (url: string): Promise<DELETE_UsersOuput> => {
  const fetchOptions: RequestInit = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

export const TopBarAvatarMenu = () => {
  const { data } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/sign-in" });
  };

  const router = useRouter();
  const { toast } = useToast();
  const { trigger, isMutating } = useSWRMutation(
    "/api/users", //
    deleteUser,
  );
  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const data = await trigger();
      if (!data.error) {
        router.replace("/sign-in");
        return;
      }
    } catch (error) {
      if (process.env.VERCEL_ENV !== "production") {
        console.log(error);
      }
    }
    // @TODO - ...
    toast({
      title: "",
      description: "",
    });
  };

  const userImage = data?.user?.image || undefined;
  const userName = data?.user?.name?.[0] || "-";
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="cursor-pointer hover:opacity-90"
          asChild
        >
          <Avatar className="h-full w-[unset] aspect-square">
            <AvatarImage src={userImage} />
            <AvatarFallback>{userName}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={2 * 4}>
          <DropdownMenuItem
            className="cursor-pointer" //
            onClick={handleSignOut}
          >
            <Text className="text-base text-primary">Me déconnecter</Text>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer" //
          >
            <AlertDialogTrigger asChild>
              <Text className="text-base text-red-600">Me désinscrire</Text>
            </AlertDialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="gap-4">
        <AlertDialogTitle>
          <Heading>Est-ce que tu es sûr ?</Heading>
        </AlertDialogTitle>
        <AlertDialogDescription>
          <Text className="text-base text-primary/70 ">
            Si tu décides de te désinscrire, ton compte sera supprimé ainsi que
            l’ensemble des données qui y sont associées, et cela de manière
            irréversible. <span className="text-primary">😵‍💫</span>
          </Text>
        </AlertDialogDescription>
        <AlertDialogFooter className="gap-1.5">
          <AlertDialogCancel className="flex-1">
            <Text className="font-bold uppercase leading-none">Non</Text>
          </AlertDialogCancel>
          <AlertDialogAction className="flex-1" onClick={handleDelete}>
            {!isMutating ? (
              <Text className="font-bold uppercase leading-none">Oui</Text>
            ) : (
              <Icon className="animate-spin" name="loader-4" />
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
