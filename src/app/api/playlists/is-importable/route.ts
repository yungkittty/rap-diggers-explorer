import { withAuth } from "@/app/_utils/auth";
import { isImportable } from "@/app/_utils/playlists";

export const GET = withAuth(
  async (
    request, //
    _,
    userId,
  ) => {
    const isImportable_ = await isImportable(userId);
    return Response.json(
      { isImportable: isImportable_ }, //
      { status: 200 },
    );
  },
);
