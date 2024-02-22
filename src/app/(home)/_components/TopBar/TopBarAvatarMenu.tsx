"use client";

import { Heading } from "@/app/_components/Heading";
import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
import { CustomError } from "@/app/_utils/errors";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MouseEvent } from "react";
import useSWRMutation from "swr/mutation";

const deleteUsers = async (url: string): Promise<DELETE_UsersOuput> => {
  const options: RequestInit = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error !== undefined) {
    throw new CustomError(data.error);
  }
  return data;
};

export const TopBarAvatarMenu = () => {
  const { data } = useSession();

  const handleSignOut = async () => {
    await signOut(
      { callbackUrl: "/sign-in" }, //
    );
  };

  const router = useRouter();
  const handleSuccess = () => {
    router.replace("/sign-in");
  };

  const { toast } = useToast();
  const handleError = () => {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
  };

  const configuration = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger, isMutating } = useSWRMutation(
    "/api/users", //
    deleteUsers,
    configuration,
  );

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    await trigger();
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
      <AlertDialogContent className="w-[550px] min-w-[550px] gap-4">
        <AlertDialogTitle>
          <Heading>Est-ce que tu es sûr ?</Heading>
        </AlertDialogTitle>
        <Text className="text-base text-primary/70 mb-0.5">
          Si tu décides de te désinscrire, ton compte sera supprimé ainsi que
          l’ensemble des données qui y sont associées, et cela de manière
          irréversible. <span className="text-primary">😵‍💫</span>
        </Text>
        <AlertDialogFooter className="gap-0.5">
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
