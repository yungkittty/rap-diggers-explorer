import prisma from "../_libs/prisma";

export const isImportable = async (userId: string): Promise<boolean> => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const artistStatusCount = await prisma.artistStatus.count({
    where: {
      userId,
      importedAt: { gte: today },
    },
  });

  const isImportable_ = artistStatusCount === 0;
  return isImportable_;
};
