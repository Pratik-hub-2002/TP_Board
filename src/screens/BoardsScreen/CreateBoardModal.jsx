import { useState } from "react";
import { Dialog, Stack, Typography, Box, TextField, Button } from "@mui/material";
import { getAuth } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import ModalHeader from "../../components/layout/ModalHeader";
import { colors } from "../../theme";
import useApp from "../../hooks/useApp";

const CreateBoardModal = ({ closeModal }) => {
    const { createBoard } = useApp();
    const [name, setName] = useState('');
    const [color, setColor] = useState(0); // Default to first color
    const [loading, setLoading] = useState(false);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handleCreate = async () => {
        if (!name.trim()) return;
        
        try {
            setLoading(true);
            // Create the board with proper structure
            await createBoard({
                name: name.trim(),
                color: color,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
                members: [currentUser.uid],
                tabs: {
                    todos: { name: "Todos", color: "primary" },
                    inProgress: { name: "In Progress", color: "secondary" },
                    done: { name: "Completed", color: "success" },
                    backlogs: { name: "Backlogs", color: "warning" }
                },
                tasks: {}
            });
            closeModal();
        } catch (err) {
            console.error('Error creating board:', err);
            // Handle error (e.g., show error message to user)
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <Dialog open onClose={closeModal} fullWidth maxWidth="xs">
            <Stack p={2}>
                <ModalHeader title="Create Board" onClose={closeModal} />
                <Stack my={5} spacing={3}>
                    <TextField 
                        label="Board Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        sx={{
                            '& input': {
                                caretColor: 'transparent'
                            },
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
                    <Button disabled={loading} onClick={handleCreate} size="large" variant="contained">Create</Button>
                </Stack>
            </Stack>
        </Dialog>
    );
};

export default CreateBoardModal;