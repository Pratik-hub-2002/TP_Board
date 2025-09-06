import { createTheme } from '@mui/material';

export const colors = [
  "#4F6D7A",  // soft blue-gray
  "#56B4D3",  // aqua blue
  "#F4A259",  // soft orange
  "#8ABEB7",  // muted teal
  "#C1C8E4",  // soft lavender
  "#D3D3D3"   // neutral gray
];

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#F8FAFC",   // very light gray background
      paper: "#FFFFFF"      // pure white cards
    },
    primary: {
      main: "#1976D2",      // professional blue
      light: "#63A4FF",
      dark: "#004BA0"
    },
    secondary: {
      main: "#4F6D7A",      // muted blue-gray accent
      light: "#7A9BAE",
      dark: "#2E4B57"
    },
    error: {
      main: "#E53935"
    },
    success: {
      main: "#2E7D32"
    },
    warning: {
      main: "#F4A259"       // warm accent orange
    },
    info: {
      main: "#0288D1"       // info blue
    },
    text: {
      primary: "#1E293B",   // near-black for readability
      secondary: "#475569"  // muted gray for less important text
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
    borderRadius: 10
  },
  components: {
    MuiIconButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10
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
              borderColor: 'rgba(25, 118, 210, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(25, 118, 210, 0.4)'
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  }
});

export default theme;
/*import { createTheme } from '@mui/material';

export const colors = [
  "#4F6D7A",  // soft blue-gray
  "#56B4D3",  // aqua blue
  "#F4A259",  // soft orange
  "#8ABEB7",  // muted teal
  "#C1C8E4",  // soft lavender
  "#D3D3D3"   // neutral gray
];

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0F172A",   // deep slate background
      paper: "#1E293B"      // slightly lighter cards
    },
    primary: {
      main: "#63A4FF",      // softer blue highlight
      light: "#8EC9FF",
      dark: "#1976D2"
    },
    secondary: {
      main: "#8ABEB7",      // muted teal for accents
      light: "#A5D7D0",
      dark: "#4F6D7A"
    },
    error: {
      main: "#FF6B6B"
    },
    success: {
      main: "#4CAF50"
    },
    warning: {
      main: "#F4A259"       // warm orange accent
    },
    info: {
      main: "#56B4D3"
    },
    text: {
      primary: "#F1F5F9",   // almost white for readability
      secondary: "#CBD5E1"  // soft gray for muted text
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
      opacity: 0.85,
      fontWeight: 300
    }
  },
  shape: {
    borderRadius: 10
  },
  components: {
    MuiIconButton: {
      defaultProps: {
        size: "small"
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "12px 24px",
          borderRadius: 10
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
              borderColor: 'rgba(99, 164, 255, 0.2)'
            },
            '&:hover fieldset': {
              borderColor: 'rgba(99, 164, 255, 0.4)'
            }
          }
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10
        }
      }
    }
  }
});

export default darkTheme;*/

