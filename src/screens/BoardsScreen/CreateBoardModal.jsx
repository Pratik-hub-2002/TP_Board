import { Dialog, Stack, Typography, Box, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ModalHeader from "../../components/layout/ModalHeader";
import { colors } from "../../theme";

const CreateBoardModal = () => {
    return (
        <Dialog open fullWidth maxWidth="xs">
            <Stack p={2}>
            <ModalHeader title="Create Board" onClose={() => {}} />
            <Stack my={5}>
                <TextField label="Board Name"/>
                <Stack direction="row" >
                    <Typography>Color:</Typography>
                    <Stack direction="row">
                      {colors.map(clr => <Box key={clr} height={25} width={25} backgroundColor={clr} borderRadius="50%" />)}
                    </Stack>
                </Stack>
            </Stack>
            </Stack>
        </Dialog>
    );
};

export default CreateBoardModal;