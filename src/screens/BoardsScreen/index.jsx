import { useState } from "react";
import Topbar from "./Topbar";
import CreateBoardModal from "./CreateBoardModal";
import NoBoards from "./NoBoards";

import { Stack, Grid, Typography, IconButton, Box } from '@mui/material';
import OpenIcon from '@mui/icons-material/Launch';

const BoardsScreen = () => {
    const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Topbar openModal={() => setShowModal(true)} />
      { showModal && <CreateBoardModal closeModal={() => setShowModal(false)} />}
      <NoBoards />

      <Grid container spacing={2}>
        <Grid item xs={3}>
        <Stack p={2} bgcolor="background.paper"> 

        </Stack>
        </Grid>
      </Grid>
    </>
  );
};

export default BoardsScreen;
