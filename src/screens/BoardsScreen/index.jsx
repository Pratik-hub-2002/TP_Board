import { Stack, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import CreateBoardModal from "./CreateBoardModal";
import Topbar from "./Topbar";
import BoardCard from "./BoardCard";
import NoBoards from "./NoBoards";
import useApp from "../../hooks/useApp";
import AppLoader from "../../components/layout/AppLoader";
import useStore from "../../store";

const BoardsScreen = () => {
    const [ loading, setLoading ] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { fetchBoards } = useApp();
    const { boards, areBoardsFetched } = useStore();
    
    useEffect(() => {
        const loadBoards = async () => {
            if (!areBoardsFetched) {
                try {
                    await fetchBoards();
                } catch (error) {
                    console.error('Failed to fetch boards:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        loadBoards();
    }, [areBoardsFetched, fetchBoards]);
    if (loading) return <AppLoader />;
  return (
    <>
      <Topbar openModal={() => setShowModal(true)} />
      { showModal && <CreateBoardModal closeModal={() => setShowModal(false)} />}
      <Stack mt={5} px={3}>
        {boards.length === 0 ? (
          <NoBoards />
        ) : (
          <Grid container spacing={4}>
            {boards.map((board) => (
              <BoardCard key={board.id} {...board} />
            ))}
          </Grid>
        )}
      </Stack>
    </>
  );
};

export default BoardsScreen;
