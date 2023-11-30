import { withAuth } from "../_hocs/auth";
import { ActionsBar } from "./_components/ActionsBar";
import { ArtistCardsCarousel } from "./_components/ArtistCardsCarousel";
import { BottomBar } from "./_components/BottomBar";
import { TopBar } from "./_components/TopBar";
import { ArtistCardsCarouselProvider } from "./_contexts/ArtistCardsCarouselContext";

const HomePage = () => {
  return (
    <div className="flex flex-col flex-1">
      <TopBar />
      <div className="flex flex-col flex-1 justify-end">
        <ArtistCardsCarouselProvider>
          <ArtistCardsCarousel />
          <ActionsBar />
        </ArtistCardsCarouselProvider>
      </div>
      <BottomBar />
    </div>
  );
};

export default withAuth(HomePage);
