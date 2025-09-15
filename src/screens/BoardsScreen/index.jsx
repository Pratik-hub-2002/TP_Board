import { Stack, Grid, Typography, Box, Button } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import CreateBoardModal from "./CreateBoardModal";
import Topbar from "./Topbar";
import BoardCard from "./BoardCard";
import NoBoards from "./NoBoards";
import useApp from "../../hooks/useApp";
import AppLoader from "../../components/layout/AppLoader";
import useStore from "../../store";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const BoardsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const { boards, areBoardsFetched } = useStore();
    const { fetchBoards } = useApp();
    const auth = getAuth();
    
    console.log('🏠 BoardsScreen rendered');
    console.log('🏠 Auth ready:', authReady);
    console.log('🏠 Current user:', auth.currentUser?.uid);
    
    // Wait for authentication to be ready
    useEffect(() => {
        console.log('🔐 Setting up auth state listener');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('🔐 Auth state changed:', user?.uid);
            setAuthReady(true);
        });
        
        return () => unsubscribe();
    }, []);

    const loadBoards = useCallback(async () => {
        if (!authReady || !auth.currentUser) {
            console.log('⏳ Waiting for authentication...');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            console.log('📊 Loading boards for user:', auth.currentUser.uid);
            
            await fetchBoards();
        } catch (error) {
            console.error('❌ Failed to fetch boards:', error);
            setError('Failed to load boards. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [authReady, auth.currentUser, fetchBoards]);

    useEffect(() => {
        if (authReady) {
            console.log('🚀 Auth ready, loading boards...');
            loadBoards();
        }
    }, [authReady]);

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
