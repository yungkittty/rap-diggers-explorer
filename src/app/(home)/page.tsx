import { withAuth } from "../_hocs/auth";
import { ActionsBar } from "./_components/ActionsBar";
import { ArtistCardsCarousel } from "./_components/ArtistCardsCarousel";
import { BottomBar } from "./_components/BottomBar/BottomBar";
import { TopBar } from "./_components/TopBar/TopBar";
import { ArtistsStatusContextProvider } from "./_contexts/ArtistStatusContext";

const HomePage = () => {
  return (
    <div className="flex flex-col flex-1">
      <ArtistsStatusContextProvider>
        <TopBar />
        <div className="flex flex-col flex-1 justify-end">
          <ArtistCardsCarousel />
          <ActionsBar />
        </div>
        <BottomBar />
      </ArtistsStatusContextProvider>
    </div>
  );
};

export default withAuth(HomePage);
