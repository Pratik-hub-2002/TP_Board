import { AppBar, Toolbar, Button, Stack } from "@mui/material";
import ImageEl from "../../components/utils/Image.El";
import LogoImg from "../../assets/logo.png";
import LogoutIcon from "@mui/icons-material/ExitToApp";
import { logout } from "../../services/auth";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";

const Topbar = ({ openModal }) => {
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

                <Stack direction="row" spacing={2}>
                    <Button onClick={openModal} variant="contained">Create Board</Button>
                    <Button onClick={() => signOut(auth)} startIcon={<LogoutIcon />} color="inherit">Logout</Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;