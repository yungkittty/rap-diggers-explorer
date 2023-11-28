import { withAuth } from "../_hocs/auth";
import { ActionsBar } from "./_components/ActionsBar";
import { ArtistsCarousel } from "./_components/ArtistCardsCarousel";
import { BottomBar } from "./_components/BottomBar";
import { TopBar } from "./_components/TopBar";

const HomePage = () => {
  return (
    <div className="flex flex-col flex-1">
      <TopBar />
      <div className="flex flex-col flex-1 w-full justify-end">
        <ArtistsCarousel />
        <ActionsBar />
      </div>
      <BottomBar />
    </div>
  );
};

export default withAuth(HomePage);
