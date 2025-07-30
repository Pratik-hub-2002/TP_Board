import { Stack, Typography, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalHeader = ({title, onClose}) => {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700} variant="h6">{title}</Typography>
            <Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
        </Stack>
    );
};
 
export default ModalHeader;
