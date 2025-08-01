import { useState } from "react";
import { Dialog, Stack, Typography, Box, TextField, Button } from "@mui/material";
import ModalHeader from "../../components/layout/ModalHeader";
import { colors } from "../../theme";

const CreateBoardModal = ({ closeModal }) => {
    const [Name, setName] = useState('');
    const [color, setColor] = useState(colors[0]);

    console.log(Name, color);
    
    return (
        <Dialog open onClose={closeModal} fullWidth maxWidth="xs">
            <Stack p={2}>
                <ModalHeader title="Create Board" onClose={closeModal} />
                <Stack my={5} spacing={3}>
                    <TextField 
                        label="Board Name" 
                        value={Name} 
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            '& input': {
                                caretColor: 'transparent'
                            }
                        }}
                    />
                    <Stack direction="row" spacing={1.5}>
                        <Typography>Color:</Typography>
                        <Stack direction="row" spacing={1}>
                            {colors.map((clr, idx) => (
                                <Box 
                                    sx={{
                                        cursor: "pointer",
                                        border: color === idx ? "3px solid #383838" : "none",
                                        outline: color === idx ? `2px solid ${clr}` : "none",
                                    }}
                                    onClick={() => setColor(idx)} 
                                    key={clr} 
                                    height={25} 
                                    width={25} 
                                    backgroundColor={clr} 
                                    borderRadius="50%"
                                />
                            ))}
                        </Stack>
                    </Stack>
                    <Button size="large" variant="contained">Create</Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default CreateBoardModal;