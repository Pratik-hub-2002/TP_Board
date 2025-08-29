import { createTheme } from '@mui/material';

export const colors = [
    "#F49D6E",
    "#E85A4F",
    "#FFD166",
    "#8ABEB7",
    "#247BA0",
    "#D3D3D3"
]


const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#1D1F26",
            paper: "#282C34"
        },
        primary: {
            main: "#BEA4FF",
            light: "#D4C4FF",
            dark: "#9B7EE6"
        },
        error: {
            main: "#FF6B6B"
        },
        success: {
            main: "#4CAF50"
        }
    },
    typography: {
        fontFamily: "Lato, sans-serif",
        h4: {
            fontWeight: 700,
            letterSpacing: "0.5px"
        },
        h6: {
            fontWeight: 700,
            letterSpacing: "0.5px"
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
            letterSpacing: "0.5px"
        },
        subtitle1: {
            opacity: 0.8,
            fontWeight: 300
        }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: "12px 24px"
                }
            }
        },
        MuiSnackbarContent: {
            styleOverrides: {
                message: {
                    fontWeight: 600,
                    textTransform: "capitalize"
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(190, 164, 255, 0.2)'
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(190, 164, 255, 0.4)'
                        }
                    }
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8
                }
            }
        }
    },
});

export default theme;