import { AppBar, Toolbar, Button, Stack, Typography, Box } from "@mui/material";
import ImageEl from "../../components/utils/Image.El";
import LogoImg from "../../assets/logo.png";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Topbar = ({ openModal }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <ImageEl sx={{ height: "50px" }} src={LogoImg} alt="TP Board" />

                <Stack direction="row" spacing={2} alignItems="center">
                    {currentUser && (
                        <Typography variant="subtitle2" sx={{ mr: 1 }}>
                            Hi, {currentUser.displayName || currentUser.email?.split('@')[0]}
                        </Typography>
                    )}
                    <Button onClick={openModal} variant="contained">
                        Create Board
                    </Button>
                    <Button 
                        onClick={handleLogout} 
                        startIcon={<LogoutIcon />} 
                        color="inherit"
                        sx={{ ml: 1 }}
                    >
                        Logout
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;