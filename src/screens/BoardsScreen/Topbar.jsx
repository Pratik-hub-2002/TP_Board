import { AppBar, Toolbar, Button, Stack } from "@mui/material";
import ImageEl from "../../components/utils/Image.El";
import LogoImg from "../../assets/logo.png";
import LogoutIcon from "@mui/icons-material/ExitToApp";

const Topbar = () => {
    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <ImageEl sx={{ height: "50px" }} src={LogoImg} alt="TP Board" />

                <Stack direction="row" spacing={2}>
                    <Button variant="contained">Create Board</Button>
                    <Button startIcon={<LogoutIcon />} color="inherit">Logout</Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;