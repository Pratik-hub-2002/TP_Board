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
        if (!name.trim() || loading) return;
        
        try {
            setLoading(true);
            console.log('🎯 Creating new board:', name.trim());
            
            // Create the board with proper structure
            const boardData = {
                name: name.trim(),
                color: color,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: currentUser.uid,
                members: [currentUser.uid],
                tabs: {
                    'todo': { id: 'todo', name: "To Do", color: "primary" },
                    'inprogress': { id: 'inprogress', name: "In Progress", color: "warning" },
                    'done': { id: 'done', name: "Done", color: "success" }
                },
                tasks: {
                    'todo': [],
                    'inprogress': [],
                    'done': []
                }
            };
            
            await createBoard(boardData);
            console.log('✅ Board created successfully');
            closeModal();
        } catch (err) {
            console.error('❌ Error creating board:', err);
            alert('Failed to create board. Please try again.');
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <Dialog 
            open 
            onClose={closeModal} 
            fullWidth 
            maxWidth="xs"
            PaperProps={{
                sx: {
                    p: 2,                // padding inside dialog
                    borderRadius: 3,     // rounded corners
                    width: "100%",       // responsive width
                    maxWidth: 400,       // limit width for big screens
                    mx: "auto"           // center on mobile
                }
            }}
        >
            <Stack spacing={3}>
                <ModalHeader title="Create Board" onClose={closeModal} />
                <TextField 
                    label="Board Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                />
                <Stack direction="row" spacing={1.5}>
                    <Typography>Color:</Typography>
                    <Stack direction="row" spacing={1}>
                        {colors.map((clr, idx) => (
                            <Box 
                                key={clr}
                                onClick={() => setColor(idx)} 
                                sx={{
                                    cursor: "pointer",
                                    border: color === idx ? "3px solid #383838" : "none",
                                    outline: color === idx ? `2px solid ${clr}` : "none",
                                }}
                                height={25} 
                                width={25} 
                                backgroundColor={clr} 
                                borderRadius="50%"
                            />
                        ))}
                    </Stack>
                </Stack>
                <Button 
                    disabled={loading} 
                    onClick={handleCreate} 
                    size="large" 
                    variant="contained"
                >
                    Create
                </Button>
            </Stack>
        </Dialog>
    );
};

export default CreateBoardModal;
