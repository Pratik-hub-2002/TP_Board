import { Snackbar } from "@mui/material";
import useStore from "../../store";

const SnackbarManager = () => {
    const { toastrMsg, setToastrMsg } = useStore();
    return (
        <Snackbar message={toastrMsg} open={!!toastrMsg} autoHideDuration={5000} onClose={() => setToastrMsg("")} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} />
    );
};

export default SnackbarManager;