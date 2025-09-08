import { Stack, Grid, Typography, Box, Button } from "@mui/material";
import { useState, useEffect } from "react";
import CreateBoardModal from "./CreateBoardModal";
import Topbar from "./Topbar";
import BoardCard from "./BoardCard";
import NoBoards from "./NoBoards";
import useApp from "../../hooks/useApp";
import AppLoader from "../../components/layout/AppLoader";
import useStore from "../../store";
import { getAuth } from "firebase/auth";

const BoardsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { fetchBoards } = useApp();
    const { boards, areBoardsFetched } = useStore();
    const auth = getAuth();
    
    const loadBoards = async () => {
        try {
            setLoading(true);
            setError(null);
            await fetchBoards();
        } catch (error) {
            console.error('Failed to fetch boards:', error);
            setError('Failed to load boards. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBoards();
    }, []);

    if (loading) return <AppLoader />;

    return (
        <>
            <Topbar openModal={() => setShowModal(true)} />
            {showModal && <CreateBoardModal closeModal={() => setShowModal(false)} />}
            <Stack mt={5} px={3}>
                {error ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="error" mb={2}>{error}</Typography>
                        <Button variant="contained" onClick={loadBoards}>
                            Retry
                        </Button>
                    </Box>
                ) : boards.length === 0 ? (
                    <NoBoards onCreateBoard={() => setShowModal(true)} />
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
